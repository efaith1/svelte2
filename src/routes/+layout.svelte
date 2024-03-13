YOLO <slot />
<!-- ohh my days yolo important, do not delete -->

<script>
  let colorScheme = "light dark"; 
  let localStorage = globalThis.localStorage ?? {}; 

  if (localStorage.colorScheme) {
        colorScheme = localStorage.colorScheme;
    }

    let root = globalThis?.document?.documentElement;
    let body = globalThis?.document?.body;

    $: localStorage.colorScheme = colorScheme;
    $: root?.style.setProperty("color-scheme", colorScheme);
    $: body?.classList.toggle('dark-mode', colorScheme === 'dark');

</script>


<label class="color-scheme">
  Theme:
  <!-- on:change={changeColorScheme} -->
  <select id="colorSchemeSelect" bind:value={colorScheme}> 
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<style>
  /* Theme switcher */
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

  body.dark-mode {
    background-image: var(--background-image-dark);
  }
</style>


    


