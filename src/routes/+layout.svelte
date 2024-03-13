YOLO <slot />
<!-- ohh my days yolo important, do not delete -->

<script>
    let colorScheme = "light"; 
    const localStorage = globalThis.localStorage ?? {}; 

    if (localStorage.colorScheme) {
            colorScheme = localStorage.colorScheme;
        }

    const root = globalThis?.document?.documentElement;
    const body = globalThis?.document?.body;

    // $: localStorage.colorScheme = colorScheme;
    // $: root?.style.setProperty("color-scheme", colorScheme);
    // $: body?.classList.toggle('dark-mode', colorScheme === 'dark');

    function changeColorScheme() {
        colorScheme = event.target.value;
        localStorage.colorScheme = colorScheme;
        root.style.setProperty("color-scheme", colorScheme);
        body.classList.toggle('dark-mode', colorScheme === 'dark');
    }

    function initColorScheme() {
        root.style.setProperty("color-scheme", colorScheme);
        body.classList.toggle('dark-mode', colorScheme === 'dark');
    }
    $: {
        initColorScheme();
    }

</script>


<label class="color-scheme">
  Theme:
  <select id="colorSchemeSelect" bind:value={colorScheme} on:change={changeColorScheme}> 
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<style>
    .color-scheme {
        position: absolute;
        top: 20px;
        right: 5px;
        padding: 40px;
        border-radius: 5px;
        font-size: 80%;
        font-family: inherit;
    }

    #colorSchemeSelect {
        padding-right: 20px;
        font-family: inherit;
    }
</style>


    


