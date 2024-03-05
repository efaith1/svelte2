
console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = {
    './': "Home",
   "projects": "Projects",
   "contact" : "Contact",
   "resume": "Resume",
    "https://github.com/efaith1/Esther-F.-website": "Github"}
;

const nav = document.createElement("nav");
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains("home");

for (let url in pages) {
    const title = pages[url];

    let a = document.createElement("a");

    if (title === "Github"){
        a.rel = 'noopener noreferrer';
        a.target = "_blank";
    }

    a.href = ARE_WE_HOME || title === "Github" ? url:  "../" + url;

    a.textContent = title;
    nav.append(a);

    console.log( a.href);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }
    
   // Open external links in a new tab
   if (a.host !== location.host) {
    a.target = "_blank";
    }

}

document.addEventListener("DOMContentLoaded", function () {
    const colorSchemeControl = document.createElement("label");
    colorSchemeControl.className = "color-scheme";
    colorSchemeControl.innerHTML = `
      Theme:
      <select id="colorSchemeSelect">
        <option value="auto">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    `;
  
    // Insert the control at the start of the <body> element
    document.body.insertAdjacentElement("afterbegin", colorSchemeControl);
  });
  

  document.addEventListener("DOMContentLoaded", function () {
    const select = document.querySelector("#colorSchemeSelect");
  
    select.addEventListener("input", function (event) {  
      document.documentElement.style.setProperty("color-scheme", event.target.value);
      document.body.classList.toggle('dark-mode', event.target.value === 'dark');
      localStorage.setItem("colorScheme", event.target.value);
    });
  
    // Load the user's preference
    const savedColorScheme = localStorage.getItem("colorScheme");
    if (savedColorScheme) {
      document.documentElement.style.setProperty("color-scheme", savedColorScheme);
      select.value = savedColorScheme;
      document.body.classList.toggle('dark-mode', savedColorScheme === 'dark');
    }
  });
  
