const menuSection = document.querySelector(".main-menu");
const introVideo = document.querySelector(".intro-video");
const primaryMenu = document.querySelector(".primary-menu");
const playMenu = document.querySelector(".play-menu");
const modeMenuBack = document.querySelector(".mode-menu-back");
const customGameScreen = document.querySelector(".custom-game-screen");

const startScreen = document.querySelector(".start-screen");

const menuNavigation = performance.getEntriesByType("navigation")[0];
if (menuNavigation && menuNavigation.type === "reload") {
    sessionStorage.removeItem("introSeen");
}
const hasSeenIntro = sessionStorage.getItem("introSeen") === "true";

if (menuSection && introVideo) {
    introVideo.addEventListener("ended", () => {
        menuSection.hidden = false;
        sessionStorage.setItem("introSeen", "true");
    }, { once: true });

    if (introVideo.ended) {
        menuSection.hidden = false;
    }
}

if (hasSeenIntro && startScreen && introVideo && menuSection) {
    startScreen.hidden = true;
    menuSection.hidden = false;
    function showLastIntroFrame() {
        introVideo.currentTime = introVideo.duration;
    }

    if (introVideo.readyState >= 1) {
        showLastIntroFrame();
    } else {
        introVideo.addEventListener("loadedmetadata", showLastIntroFrame, { once: true });
    }
    autoStartMusic();
}

if (!hasSeenIntro && startScreen && introVideo) {
    function startExperience() {
        document.removeEventListener("keydown", startExperience);
        document.removeEventListener("pointerdown", startExperience);

        startScreen.hidden = true;
        introVideo.play().catch(() => {});
        startMusic();
    }

    document.addEventListener("keydown", startExperience);
    document.addEventListener("pointerdown", startExperience);
}

if (menuSection && primaryMenu && playMenu && modeMenuBack && customGameScreen) {
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

    function openCustomGame() {
        menuSection.hidden = true;
        customGameScreen.hidden = false;
        customGameScreen.querySelector(".name-input")?.focus();
    }

    function returnToModeMenu() {
        customGameScreen.hidden = true;
        menuSection.hidden = false;
        modeMenuBack.hidden = false;
        primaryMenu.hidden = true;
        playMenu.hidden = false;
        activeMenuIndex = 1;
        selectOption(selectedIndexes[activeMenuIndex], true);
    }

    function openCollection() {
        window.location.href = "pages/collection.html";
    }

    function startBransonMode() {
        sessionStorage.setItem("gameMode", "branson");
        sessionStorage.removeItem("customNames");
        window.location.href = "pages/game.html";
    }

    function returnToPrimaryMenu() {
        playMenu.hidden = true;
        modeMenuBack.hidden = true;
        primaryMenu.hidden = false;
        activeMenuIndex = 0;
        selectOption(selectedIndexes[activeMenuIndex], true);
    }

    function activateSelectedOption() {
        const selectedOption = getOptions()[selectedIndexes[activeMenuIndex]];

        if (!selectedOption) {
            return;
        }

        if (activeMenuIndex === 0 && selectedOption.classList.contains("play-button")) {
            primaryMenu.hidden = true;
            modeMenuBack.hidden = false;
            playMenu.hidden = false;
            activeMenuIndex = 1;
            selectOption(selectedIndexes[activeMenuIndex], true);
        } else if (activeMenuIndex === 0 && selectedOption.classList.contains("collection-button")) {
            openCollection();
        } else if (activeMenuIndex === 1 && selectedOption.classList.contains("branson-mode-button")) {
            startBransonMode();
        } else if (activeMenuIndex === 1 && selectedOption.classList.contains("custom-game-button")) {
            openCustomGame();
        }
    }

    document.addEventListener("keydown", (event) => {
        if (!customGameScreen.hidden && event.key === "Escape") {
            event.preventDefault();
            returnToModeMenu();
            return;
        }

        if (!menuSection.hidden && !playMenu.hidden && event.target === modeMenuBack && event.key === "Enter") {
            event.preventDefault();
            returnToPrimaryMenu();
            return;
        }

        if (menuSection.hidden) {
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

    modeMenuBack.addEventListener("click", returnToPrimaryMenu);
    customGameScreen.querySelector(".custom-game-back").addEventListener("click", returnToModeMenu);
}
