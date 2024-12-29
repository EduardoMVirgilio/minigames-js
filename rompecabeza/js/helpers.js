const getRoot = () => document.documentElement;
export const setTheme = (theme) => {
    getRoot().setAttribute('data-theme', theme);
    getElement(`[name="theme"][value="${theme}"]`).checked = true;
}
export const getElement = (selector) => document.querySelector(selector);
export const getElements = (selector) => document.querySelectorAll(selector);
export const addClass = (element, className) => getElement(element).classList.add(className);
export const removeClass = (element, className) => getElement(element).classList.remove(className);
