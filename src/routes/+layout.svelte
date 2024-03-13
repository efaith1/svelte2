YOLO <slot />

<script>
    let colorScheme = "light dark"; 
    let localStorage = globalThis.localStorage ?? {}; 
  
    if (localStorage.colorScheme) {
      colorScheme = localStorage.colorScheme;
    }
  
    let root = globalThis?.document?.documentElement;
    $: root?.style.setProperty("color-scheme", colorScheme);
  
    $: localStorage.colorScheme = colorScheme;

</script>


<!-- Theme: -->
<select id="colorSchemeSelect" bind:value={ colorScheme }>
<option value="auto">Automatic</option>
<option value="light">Light</option>
<option value="dark">Dark</option>
</select>

<style>
/* dark mode */
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
