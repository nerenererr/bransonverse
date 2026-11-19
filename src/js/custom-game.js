const customGameForm = document.querySelector(".custom-game-form");

if (customGameForm) {
    const nameColumns = Array.from(customGameForm.querySelectorAll(".name-column"));
    const nameProgress = customGameForm.querySelector(".name-progress");
    const nameCount = customGameForm.querySelector(".name-count");
    const addNameButton = customGameForm.querySelector(".add-name-button");
    const feedback = customGameForm.querySelector(".custom-game-feedback");
    const maximumNames = 15;
    const minimumNames = 9;
    let names = Array(minimumNames).fill("");
    let hasSubmitted = false;

    nameProgress.replaceChildren(...Array.from({ length: maximumNames }, () => {
        const slot = document.createElement("span");
        return slot;
    }));

    function getDuplicateIndexes() {
        const occurrences = new Map();
        const duplicates = new Set();

        names.forEach((name, index) => {
            const normalizedName = name.trim().toLocaleLowerCase("es");
            if (!normalizedName) {
                return;
            }

            if (occurrences.has(normalizedName)) {
                duplicates.add(occurrences.get(normalizedName));
                duplicates.add(index);
            } else {
                occurrences.set(normalizedName, index);
            }
        });

        return duplicates;
    }

    function renderNameRow(index, duplicateIndexes) {
        const row = document.createElement("div");
        row.className = "name-row";

        const number = document.createElement("span");
        number.className = "name-number";
        number.textContent = String(index + 1);
        number.setAttribute("aria-hidden", "true");

        const input = document.createElement("input");
        input.className = "name-input";
        input.type = "text";
        input.maxLength = 30;
        input.autocomplete = "off";
        input.spellcheck = false;
        input.dataset.nameIndex = String(index);
        input.placeholder = "Escribe un nombre";
        input.setAttribute("aria-label", `Nombre ${index + 1}`);
        input.value = names[index];
        input.setAttribute("aria-invalid", String(
            hasSubmitted && (!names[index].trim() || duplicateIndexes.has(index))
        ));
        input.addEventListener("input", () => {
            names[index] = input.value;
            hasSubmitted = false;
            feedback.textContent = "";
            updateNameValidationState();
            updateNameSummary();
        });

        const removeButton = document.createElement("button");
        removeButton.className = "remove-name-button";
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", `Eliminar nombre ${index + 1}`);
        removeButton.addEventListener("click", () => {
            if (names.length > minimumNames) {
                names.splice(index, 1);
            } else {
                names[index] = "";
            }
            hasSubmitted = false;
            feedback.textContent = "";
            renderNames();
            updateNameSummary();
            const nextInputIndex = Math.min(index, names.length - 1);
            focusNameInput(nextInputIndex);
        });

        row.classList.toggle(
            "is-invalid",
            hasSubmitted && (!names[index].trim() || duplicateIndexes.has(index))
        );
        row.append(number, input, removeButton);
        return row;
    }

    function focusNameInput(index) {
        const leftColumnCount = Math.ceil(names.length / 2);
        const columnIndex = index < leftColumnCount ? 0 : 1;
        const inputIndex = columnIndex === 0 ? index : index - leftColumnCount;
        nameColumns[columnIndex].querySelectorAll(".name-input")[inputIndex]?.focus();
    }

    function renderNames() {
        const duplicateIndexes = getDuplicateIndexes();
        const leftColumnCount = Math.ceil(names.length / 2);

        nameColumns.forEach((column, columnIndex) => {
            const start = columnIndex === 0 ? 0 : leftColumnCount;
            const end = columnIndex === 0 ? leftColumnCount : names.length;
            const rows = [];

            for (let index = start; index < end; index += 1) {
                rows.push(renderNameRow(index, duplicateIndexes));
            }

            column.replaceChildren(...rows);
        });
    }

    function updateNameValidationState() {
        const duplicateIndexes = getDuplicateIndexes();

        customGameForm.querySelectorAll(".name-row").forEach((row) => {
            const input = row.querySelector(".name-input");
            const index = Number(input.dataset.nameIndex);
            const isInvalid = hasSubmitted && (!names[index].trim() || duplicateIndexes.has(index));

            input.setAttribute("aria-invalid", String(isInvalid));
            row.classList.toggle("is-invalid", isInvalid);
        });
    }

    function updateNameSummary() {
        const filledCount = names.filter((name) => name.trim()).length;
        nameCount.value = `${filledCount}/${maximumNames}`;

        nameProgress.querySelectorAll("span").forEach((slot, index) => {
            slot.classList.toggle("is-filled", index < filledCount);
            slot.classList.toggle("is-invalid", hasSubmitted && filledCount < minimumNames && index >= filledCount);
        });

        addNameButton.disabled = names.length >= maximumNames;
    }

    function validateNames() {
        const duplicateIndexes = getDuplicateIndexes();
        const emptyIndexes = names
            .map((name, index) => name.trim() ? -1 : index)
            .filter((index) => index !== -1);
        const invalidIndexes = [...new Set([...emptyIndexes, ...duplicateIndexes])];

        hasSubmitted = true;
        renderNames();
        updateNameSummary();

        if (names.length < minimumNames) {
            feedback.textContent = `Añade al menos ${minimumNames} nombres para comenzar.`;
        } else if (emptyIndexes.length) {
            feedback.textContent = "Completa todos los campos antes de comenzar.";
        } else if (duplicateIndexes.size) {
            feedback.textContent = "No puede haber nombres repetidos.";
        } else {
            startCustomGame();
            return;
        }

        const invalidInput = customGameForm.querySelectorAll(".name-input")[invalidIndexes[0]];
        invalidInput?.focus();
    }

    function startCustomGame() {
        const cleanNames = names.map((name) => name.trim());
        sessionStorage.setItem("gameMode", "custom");
        sessionStorage.setItem("customNames", JSON.stringify(cleanNames));
        window.location.href = "pages/game.html";
    }

    addNameButton.addEventListener("click", () => {
        if (names.length >= maximumNames) {
            return;
        }

        names.push("");
        hasSubmitted = false;
        feedback.textContent = "";
        renderNames();
        updateNameSummary();
        customGameForm.querySelectorAll(".name-input")[names.length - 1]?.focus();
    });

    customGameForm.addEventListener("submit", (event) => {
        event.preventDefault();
        validateNames();
    });

    renderNames();
    updateNameSummary();
}