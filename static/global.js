function $$ (selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

let pages = {
    'svelte2': "Home",
   "svelte2/projects": "Projects",
   "svelte2/contact" : "Contact",
   "svelte2/resume": "Resume",
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
  
