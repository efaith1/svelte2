<script>
  export let info = {};
  export let hLevel = 2;
</script>

<article>
  <a href={info.link}>
    <svelte:element this={"h" + hLevel}>{info.title}</svelte:element>
  </a>
  <img src={info.image} alt="" />
  <p>{info.description}</p>
  {#if info.year}
    <div class="year">c. {info.year}</div>
  {/if}
</article>

<style>
  article {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;
  }
  .year {
    font-family: Baskerville, serif;
    font-variant-numeric: oldstyle-nums;
    margin-top: 2 px;
  }
</style>
