const menuSection = document.querySelector(".main-menu");
const introVideo = document.querySelector(".intro-video");
const primaryMenu = document.querySelector(".primary-menu");
const playMenu = document.querySelector(".play-menu");

if (menuSection && introVideo) {
    introVideo.addEventListener("ended", () => {
        menuSection.hidden = false;
    }, { once: true });

    if (introVideo.ended) {
        menuSection.hidden = false;
    }
}

if (menuSection && primaryMenu && playMenu) {
    const menus = [primaryMenu, playMenu];
    const selectedIndexes = menus.map((menu) =>
        Array.from(menu.querySelectorAll("button")).findIndex(
            (option) => option.getAttribute("aria-pressed") === "true"
        )
    );
    let activeMenuIndex = 0;

    function getOptions() {
        return Array.from(menus[activeMenuIndex].querySelectorAll("button"));
    }

    function selectOption(index, focus = false) {
        const options = getOptions();
        selectedIndexes[activeMenuIndex] = index;

        options.forEach((option, optionIndex) => {
            const isSelected = optionIndex === index;
            option.setAttribute("aria-pressed", String(isSelected));
            option.tabIndex = isSelected ? 0 : -1;
        });

        if (focus) {
            options[index].focus();
        }
    }

    function activateSelectedOption() {
        const options = getOptions();
        const selectedOption = options[selectedIndexes[activeMenuIndex]];

        if (activeMenuIndex === 0 && selectedOption.classList.contains("play-button")) {
            primaryMenu.hidden = true;
            playMenu.hidden = false;
            activeMenuIndex = 1;
            selectOption(selectedIndexes[activeMenuIndex], true);
        }
    }

    document.addEventListener("keydown", (event) => {
        if (menuSection?.hidden) {
            return;
        }

        const isTextEntry = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
        if (event.target.isContentEditable || isTextEntry) {
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            activateSelectedOption();
            return;
        }

        let direction;

        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            direction = -1;
        } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            direction = 1;
        } else {
            return;
        }

        event.preventDefault();
        const options = getOptions();
        const selectedIndex = selectedIndexes[activeMenuIndex];
        selectOption((selectedIndex + direction + options.length) % options.length, true);
    });

    menus.forEach((menu, menuIndex) => {
        menu.addEventListener("click", (event) => {
            const options = Array.from(menu.querySelectorAll("button"));
            const optionIndex = options.indexOf(event.target.closest("button"));

            if (optionIndex === -1) {
                return;
            }

            activeMenuIndex = menuIndex;
            selectOption(optionIndex);
            activateSelectedOption();
        });
    });
}