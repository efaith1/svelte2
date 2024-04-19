<script>
  import * as d3 from "d3";

  export let data = [];
  export let selectedIndex = -1;
  export let colors = [];
  export let transitionDuration = 3000; // add ms or nah

  let arcData = [];
  let pieData;
  let arcs = [];
  // let wedges = {}; // step 4
  // let oldData = []; // step 4
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  $: {
    pieData = data.map((d) => ({ ...d }));
  }
  $: {
    // oldData = pieData; // step 4

    arcData = sliceGenerator(pieData);
    arcs = arcData.map((d) => arcGenerator(d));
    pieData = d3.sort(data, (d) => d.label);
    pieData = pieData.map((d, i) => ({ ...d, ...arcData[i], arc: arcs[i] }));
    // transitionArcs();
  }

  // function 1/6 - called below, looks fine
  // function sameArc(arc1, arc2) {
  //   if (!arc1 || !arc2) {
  //     return !arc1 && !arc2;
  //   }
  //   return (
  //     arc1.startAngle === arc2.startAngle && arc1.endAngle === arc2.endAngle
  //   );
  // }

  // function 2/6 - wrote
  // function transitionArcs() {
  //   let wedgeElements = Object.values(wedges);

  //   d3.selectAll(wedgeElements)
  //     .transition("arc")
  //     .duration(transitionDuration)
  //     .styleTween("d", function (_, index) {
  //       let wedge = this;
  //       let label = Object.keys(wedges)[index];
  //       let transition = transitionArc(wedge, label);
  //       return transition?.interpolator;
  //     });
  // }

  // function 3/6 - called above
  // function transitionArc(wedge, label) {
  //   label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];
  //   let d = pieData.find((d) => d.label === label);
  //   let d_old = oldData.find((d) => d.label === label);

  //   if (sameArc(d_old, d)) {
  //     return null;
  //   }

  //   let from = d_old ? { ...d_old } : getEmptyArc(label, oldData);
  //   let to = d ? { ...d } : getEmptyArc(label, pieData);
  //   let angleInterpolator = d3.interpolate(from, to);

  //   let interpolator = (t) => `path("${arcGenerator(angleInterpolator(t))}")`;

  //   let type = d ? (d_old ? "update" : "in") : "out";

  //   return { d, d_old, from, to, interpolator, type };
  // }

  // function 4/6 - used as a transition directive in path for svg below
  // possible source of error............
  // function arc(wedge) {
  //   return {
  //     duration: transitionDuration,
  //     easing: d3.easeCubic,
  //     css: (t, u) => {
  //       let transition = transitionArc(wedge);
  //       if (!transition) return "";

  //       let { d, d_old, from, to, type } = transition;
  //       let arcString = type === "update" ? d : type === "in" ? to : from;
  //       return `path("${arcGenerator(arcString)}")`;
  //     },
  //   };
  // }

  // // function 5/6 - given
  // function getEmptyArc(label, data = pieData) {
  //   let labels = d3.sort(new Set([...oldData, ...pieData].map((d) => d.label)));
  //   let labelIndex = labels.indexOf(label);
  //   let sibling;
  //   for (let i = labelIndex - 1; i >= 0; i--) {
  //     sibling = data.find((d) => d.label === labels[i]);
  //     if (sibling) {
  //       break;
  //     }
  //   }

  //   let angle = sibling?.endAngle ?? 0;
  //   return { startAngle: angle, endAngle: angle };
  // }

  // function 6/6 - defined previously
  // function toggleWedge(label, event) {
  //   if (!event.key || event.key === "Enter") {
  //     selectedIndex = selectedIndex === label ? -1 : label;
  //   }
  // }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each pieData as d, index}
      <!-- {#each pieData as d, index (d.label)} 
     on:click={(e) => toggleWedge(d.label, e)}
        on:keyup={(e) => toggleWedge(d.label, e)} bind:this={wedges[d.label]}
        style="transition: d {transitionDuration}ms;"
        transition:arc-->
      <path
        d={d.arc}
        fill={colors(d.id ?? d.label)}
        fill-opacity="0.75"
        class:selected={selectedIndex === index}
        tabindex="0"
        role="button"
        aria-label="Select Wedge"
        on:click={(e) => (selectedIndex = selectedIndex === index ? -1 : index)}
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each pieData as d, index}
      <!-- {#each pieData as d, index (d.label)} -->
      <li
        style="--color: {colors(index)}"
        class:selected={selectedIndex === index}
      >
        <span class="swatch"></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  svg {
    max-width: 20em;
    margin-block: 2em;
    overflow: visible;
  }

  svg:has(path:hover, path:focus-visible) {
    path:not(:hover, :focus-visible) {
      opacity: 50%;
    }
  }

  path {
    transition: 3s;
    transition-property: transform, opacity, fill;
    outline: none;
  }

  .selected {
    --color: oklch(60% 45% 0) !important;

    &:is(path) {
      fill: var(--color);
    }
  }

  .legend {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    gap: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    margin: 0;
    flex: 1;
    margin-left: 10px;
  }

  .legend li {
    display: flex;
    align-items: center;
  }

  .legend li .swatch {
    width: 20px;
    height: 20px;
    background-color: var(--color);
    margin-right: 5px;
    border-radius: 50%;
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
