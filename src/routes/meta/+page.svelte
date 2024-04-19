<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";
  import { format } from "d3-format";
  import Pie from "$lib/Pie.svelte";
  import Scrolly from "svelte-scrolly";
  import FileLines from "./FileLines.svelte";

  let data = [];
  let commits = [];
  let totalLOC = 0;
  let numCommits = 0;
  let numFiles = 0;
  let maxPeriod = "";
  let authors = 0;
  let svg;
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let width = 1000,
    height = 600;
  let margin = { top: 10, right: 10, bottom: 30, left: 20 };
  let usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  let xScale, yScale, xAxis, yAxis, yAxisGridlines;

  let hoveredIndex = -1;

  let selectedCommits = [];
  let hasSelection = false;
  let languageBreakdown;

  let hoveredCommit = {};
  let commitTooltip;
  let tooltipPosition = { x: 0, y: 0 };

  let fileProgress = 0;
  let commitProgress = 0;

  $: timeScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, 100])
    .nice();

  let filteredCommits;
  let filteredLines;

  $: commitMaxTime = timeScale.invert(commitProgress);
  $: fileMaxTime = timeScale.invert(fileProgress);

  $: filteredCommits = commits.filter(
    (commit) => commit.datetime <= commitMaxTime
  );
  $: filteredLines = data.filter((line) => line.datetime <= commitMaxTime);

  $: filteredFileLines = data.filter((line) => line.datetime <= fileMaxTime);

  $: {
    if (hoveredIndex != -1) {
      hoveredCommit = filteredCommits[hoveredIndex];
    }
  }
  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));
  });

  $: commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: "https://github.com/vis-society/lab-7/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });

  // summary stats
  $: d3.sort(filteredCommits, (d) => -d.totalLines);

  $: totalLOC = filteredLines.length;

  $: numCommits = filteredCommits.length;

  $: numFiles = d3.group(filteredLines, (d) => d.file).size;

  $: {
    let workByPeriod = d3.rollups(
      filteredLines,
      (v) => v.length,
      (d) => d.datetime.toLocaleString("en", { dayPeriod: "short" })
    );
    maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  }

  $: authors = d3.group(filteredLines, (d) => d.author).size;

  $: xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredLines, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.top, usableArea.bottom]);

  $: rScale = d3
    .scaleSqrt()
    .domain(d3.extent(data, (d) => d.length))
    .range([3, 30])
    .nice();

  $: {
    xAxis = d3
      .select(svg)
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(d3.axisBottom(xScale));

    yAxis = d3
      .select(svg)
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00")
      );
  }

  $: {
    yAxisGridlines = d3
      .select(svg)
      .append("g")
      .attr("class", "gridlines")
      .style("opacity", 0.2)
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));
  }

  $: {
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  }
  async function dotInteraction(index, evt) {
    if (evt.type === "mouseenter" || evt.type === "focus") {
      hoveredIndex = index;
      let hoveredDot = evt.target;
      tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
        strategy: "fixed",
        middleware: [offset(5), autoPlacement()],
      });
    } else if (evt.type === "mouseleave" || evt.type === "blur") {
      hoveredIndex = -1;
    } else if (
      evt.type === "click" ||
      (evt.type === "keyup" && evt.key === "Enter")
    ) {
      selectedCommits = [commits[index]];
    }
  }

  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : filteredCommits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
  }

  function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
  }

  $: hasSelection = selectedCommits.length > 0;

  $: selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(
    (d) => d.lines
  );

  $: languageBreakdown = d3.rollup(
    selectedLines,
    (v) => v.length,
    (d) => d.type
  );

  let dummyNarrative = [
    "Advancing my proficiency in HTML5 and CSS3 for responsive designs",
    "Deepening my understanding of JavaScript libraries like D3.js for interactive visualizations",
    "Strengthening my grasp of data visualization frameworks such as Chart.js or Plotly.js",
    "Improving the performance of my web-based data visualizations",
    "Sharpening my skills in integrating data APIs into web applications",
    "Refining my knowledge of SVG graphics for scalable and dynamic visualizations",
    "Broadening my expertise in WebGL for high-performance 3D visualizations",
    "Elevating the accessibility of my data visualizations for diverse users",
    "Enhancing the responsiveness and user experience of my data-driven web applications",
    "Fine-tuning my understanding of data formats such as JSON and CSV for web-based visualizations",
    "Amplifying the security measures in my web applications handling sensitive data",
    "Enriching the interactivity of my data visualizations through user interactions and animations",
    "Optimizing the cross-browser compatibility and performance of my web-based data visualizations",
  ];
  function choose_phrase() {
    let index = Math.floor(Math.random() * dummyNarrative.length);
    return dummyNarrative[index];
  }
</script>

<h1>Meta</h1>
<svelte:head>
  <title>Meta</title>
</svelte:head>

<section>
  <dl class="stats">
    <div class="flex-container">
      <dt>TOTAL <abbr title="Lines of code">LOC</abbr></dt>
      <!-- <dd>{filteredLines.length}</dd> -->
      <dd>52</dd>

      <dt>COMMITS</dt>
      <!-- <dd>{filteredCommits.length}</dd> -->
      <dd>3</dd>

      <dt>AVERAGE LINE LENGTH</dt>
      <!-- <dd>{d3.mean(filteredLines, (d) => d.length)}</dd> -->
      <dd>20.25</dd>

      <dt>LONGEST LINE</dt>
      <!-- <dd>{d3.max(filteredLines, (d) => d.length)}</dd> -->
      <dd>80</dd>

      <dt>MAX LINES</dt>
      <!-- <dd>{d3.max(filteredLines, (d) => d.line)}</dd> -->
      <dd>153</dd>
    </div>
  </dl>
</section>

<h2>Title: Commits by time of day</h2>

<Scrolly bind:progress={commitProgress} throttle={300}>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })}, I made
      <a href={commit.url} target="_blank"
        >{index > 0
          ? "another glorious commit"
          : "my first commit, and it was glorious"}</a
      >. I edited {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. {choose_phrase()}.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <svg viewBox="0 0 {width} {height}" bind:this={svg}>
      <g class="dots">
        <!-- // filteredcommits or nah -->
        {#each filteredCommits as commit, index (commit.id)}
          <circle
            class:selected={isCommitSelected(commit)}
            cx={xScale(commit.datetime)}
            cy={yScale(commit.hourFrac)}
            r={rScale(commit.totalLines)}
            fill="steelblue"
            tabindex="0"
            aria-describedby="commit-tooltip"
            role="tooltip"
            aria-haspopup="true"
            on:focus={(evt) => dotInteraction(index, evt)}
            on:blur={(evt) => dotInteraction(index, evt)}
            on:mouseenter={(evt) => dotInteraction(index, evt)}
            on:mouseleave={(evt) => dotInteraction(index, evt)}
            on:click={(evt) => dotInteraction(index, evt)}
            on:keyup={(evt) => dotInteraction(index, evt)}
            style=" --r: {rScale(commit.totalLines)};"
          />
        {/each}
        {#each selectedCommits as commit}
          <circle
            cx={xScale(commit.datetime)}
            cy={yScale(commit.hourFrac)}
            r={rScale(commit.totalLines)}
            fill="orange"
          />
        {/each}
      </g>
    </svg>

    <dl
      id="commit-tooltip"
      class="info tooltip"
      hidden={hoveredIndex === -1}
      style={`top: ${tooltipPosition.y}px; left: ${tooltipPosition.x}px`}
      bind:this={commitTooltip}
    >
      <dt><b>Commit</b></dt>
      <dd>
        <a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a>
      </dd>

      <dt><b>Date</b></dt>
      <dd>{hoveredCommit.datetime?.toLocaleString("en", { date: "full" })}</dd>

      <dt>
        <b>Total</b> <abbr title="Lines of code"><b>lines of code</b></abbr>
      </dt>
      <dd>{totalLOC}</dd>

      <dt><b>Total Commits</b></dt>
      <dd>{numCommits}</dd>

      <dt><b>Files</b></dt>
      <dd>{numFiles}</dd>

      <dt><b>Time of Day most work is done</b></dt>
      <dd>{maxPeriod}</dd>

      <dt><b>Total Authors</b></dt>
      <dd>
        {authors}
      </dd>
    </dl>

    <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

    <Pie
      data={Array.from(languageBreakdown).map(([language, lines]) => ({
        label: language,
        value: lines,
      }))}
      {colors}
    />
    <section>
      {#each Array.from(languageBreakdown) as [language, lines]}
        <div>{language}: {$format(".1~%")(lines / selectedLines.length)}</div>
      {/each}
    </section>
  </svelte:fragment>
</Scrolly>

<Scrolly
  bind:progress={fileProgress}
  throttle={200}
  --scrolly-layout="viz-first"
  --scrolly-viz-width="1.5fr"
>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString("en", {
        dateStyle: "full",
        timeStyle: "short",
      })}, I made
      <a href={commit.url} target="_blank"
        >{index > 0
          ? "another glorious commit"
          : "my first commit, and it was glorious"}</a
      >. I edited {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file
      ).length} files. {choose_phrase()}.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <!-- <FileLines {colors} lines={filteredLines} /> -->
    <h1>Codebase evaluation</h1>
    <FileLines lines={filteredFileLines} {colors} />
  </svelte:fragment>
</Scrolly>

<style>
  :global(body) {
    max-width: min(120ch, 80vw);
  }
  dl {
    display: contents;
  }

  dl.info dt {
    font-weight: bold;
    margin-bottom: 5px;
  }

  dl.info dd {
    margin-bottom: 10px;
    color: #666;
  }

  svg {
    overflow: visible;
  }

  .data_section {
    background-color: transparent;
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 20px;
  }

  .stats {
    display: inline-block;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .flex-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  dt {
    font-weight: bold;
  }

  dd {
    margin-left: 0;
    font-style: italic;
  }

  dl.info {
    transition-duration: 500ms;
    transition-property: opacity, visibility;

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }
  }

  .tooltip {
    position: fixed;
    display: grid;
    max-width: fit-content;
    grid-template-columns: auto 1fr;
    gap: 5px;
    margin: 0;
    padding: 10px;
    background-color: oklch(100% 0% 0 / 80%);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  circle {
    --r: 5;
    transition:
      all 200ms,
      r calc(var(--r) * 100ms);
    transform-origin: center;
    transform-box: fill-box;

    &.selected {
      fill: red;
    }

    /* @starting-style rule */
    @starting-style {
      r: 0;
    }
  }

  circle:hover {
    transform: scale(1.5);
  }

  section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @keyframes marching-ants {
    to {
      stroke-dashoffset: -8;
    }
  }

  svg :global(.selection) {
    fill-opacity: 10%;
    stroke: black;
    stroke-opacity: 70%;
    stroke-dasharray: 5 3;
    animation: marching-ants 2s linear infinite;
  }

  time {
    margin-top: 0.5em;
  }
</style>
