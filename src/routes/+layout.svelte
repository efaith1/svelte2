YOLO <slot />
<!-- ohh my days yolo important -->

<script>
  let colorScheme = "light dark"; 
  let localStorage = globalThis.localStorage ?? {}; 

  if (localStorage.colorScheme) {
        colorScheme = localStorage.colorScheme;
    }

    let root = globalThis?.document?.documentElement;

    $: localStorage.colorScheme = colorScheme;
    $: root?.style.setProperty("color-scheme", colorScheme);


    // document.addEventListener("DOMContentLoaded", function () {
    //     const select = document.querySelector("#colorSchemeSelect");

    //     select.addEventListener("input", function (event) {
    //         colorScheme = event.target.value;
    //         document.documentElement.style.setProperty("color-scheme", colorScheme);
    //         document.body.classList.toggle('dark-mode', colorScheme === 'dark');
    //         localStorage.setItem("colorScheme", colorScheme);
    //     });
    // });
    // function changeColorScheme(event) {
    // colorScheme = event.target.value;
    // document.documentElement.style.setProperty("color-scheme", colorScheme);
    // document.body.classList.toggle('dark-mode', colorScheme === 'dark');
    // localStorage.setItem("colorScheme", colorScheme);
//   }

</script>


<label class="color-scheme">
  Theme:
  <!-- on:change={changeColorScheme} -->
  <select bind:value={colorScheme}> 
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


    


