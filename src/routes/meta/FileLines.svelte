<script>
  import { flip as originalFlip } from "svelte/animate";

  import * as d3 from "d3";
  export let lines = [];

  export let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let files = [];
  $: {
    files = group(lines, (d) => d.file).map(([name, lines]) => {
      return { name, lines };
    });
    files = d3.sort(files, (d) => -d.lines.length);
  }

  // something about duration
  function getFlip() {
    return originalFlip;
  }

  $: flip = getFlip(files);
</script>

<dl class="files">
  {#each files as file (file.name)}
    <div>
      <dt>
        <code>{file.name}</code> <small>({file.lines.length} lines)</small>
      </dt>
      <dd>
        {#each file.lines as line (line.line)}
          <div
            class="line"
            in:scale
            animate:flip
            style="--color: {colors(line.type)}"
          ></div>
        {/each}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .files {
    display: grid;
  }

  .files > div {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    background: hsl(0 0% 100% / 90%);
    box-shadow: 0 0 0.2em 0.2em hsl(0 0% 100% / 90%);
  }

  .files dt {
    grid-column: 1;
  }

  .files dd {
    grid-column: 2;
  }

  .line {
    display: flex;
    width: 0.5em;
    aspect-ratio: 1;
    background: steelblue;
    border-radius: 50%;
  }

  dl {
    display: contents;
  }

  dl.info dt {
    font-weight: bold;
    margin-bottom: 5px;
  }
  dl.info {
    transition-duration: 500ms;
    transition-property: opacity, visibility;

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }
  }
  dl.info dd {
    margin-bottom: 10px;
    color: #666;
  }

  dd {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    align-content: start;
    gap: 0.15em;
    padding-top: 0.6em;
    margin-left: 0;
  }
</style>
