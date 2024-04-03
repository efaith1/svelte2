<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";
  import { format } from "d3-format";
  import Pie from "$lib/Pie.svelte";

  let data = [];
  let commits = [];
  let totalLOC = 0;
  let numCommits = 0;
  let numFiles = 0;
  let maxPeriod = "";
  let authors = 0;
  let totalLinesEdited = 0;
  let svg;

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
  let brushSelection = [];

  let selectedCommits = [];
  let hasSelection = false;
  let selectedLines = [];
  let languageBreakdown = new Map();

  let hoveredCommit = {};
  let commitTooltip;
  let tooltipPosition = { x: 0, y: 0 };

  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));

    commits = d3
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

    totalLOC = data.length;

    numCommits = commits.length;

    numFiles = d3.group(data, (d) => d.file).size;

    let workByPeriod = d3.rollups(
      data,
      (v) => v.length,
      (d) => d.datetime.toLocaleString("en", { dayPeriod: "short" })
    );
    maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    authors = d3.group(data, (d) => d.author).size;

    totalLinesEdited = d3.sum(data, (d) => d.length);

    xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();

    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);

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

    yAxisGridlines = d3
      .select(svg)
      .append("g")
      .attr("class", "gridlines")
      .style("opacity", 0.2)
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

    function brushed(evt) {
      brushSelection = evt.selection;
      console.log("inside mount", brushSelection);
    }
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  });

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
    }
  }

  $: hoveredCommit = commits[hoveredIndex] ?? {};

  $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];

  $: hasSelection = brushSelection && selectedCommits.length > 0;

  $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
    (d) => d.lines
  );

  $: languageBreakdown = d3.rollup(
    selectedLines,
    (v) => v.length,
    (d) => d.type
  );

  function isCommitSelected(commit) {
    console.log("outside mount", brushSelection);

    if (brushSelection.length === 0) {
      console.log("Brush selection is empty in iscommitselected");
      return false;
    }
    let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
    let x = xScale(commit.date);
    let y = yScale(commit.hourFrac);
    console.log(
      "returned value",
      x >= min.x && x <= max.x && y >= min.y && y <= max.y
    );
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
  }
</script>

<h1>Meta</h1>
<svelte:head>
  <title>Meta</title>
</svelte:head>

<h2>Title: Commits by time of day</h2>
<!-- class:selected-dot={isCommitSelected(commit)} -->

<svg viewBox="0 0 {width} {height}" bind:this={svg}>
  <g class="dots">
    {#each commits as commit, index}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r="5"
        fill={isCommitSelected(commit) ? "red" : "steelblue"}
        tabindex="0"
        aria-describedby="commit-tooltip"
        role="tooltip"
        aria-haspopup="true"
        on:focus={(evt) => dotInteraction(index, evt)}
        on:blur={(evt) => dotInteraction(index, evt)}
        on:mouseenter={(evt) => dotInteraction(index, evt)}
        on:mouseleave={(evt) => dotInteraction(index, evt)}
      />
    {/each}
  </g>
</svg>

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

<section>
  {#each Array.from(languageBreakdown) as [language, lines]}
    <div>{language}: {$format(".1~%")(lines / selectedLines.length)}</div>
  {/each}
</section>

<Pie
  data={Array.from(languageBreakdown).map(([language, lines]) => ({
    label: language,
    value: lines,
  }))}
/>

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

  <dt><b>Lines edited</b></dt>
  <dd>
    {totalLinesEdited}
  </dd>
</dl>

<style>
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

  .selected-dot {
    fill: red;
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
    transition: transform 200ms;
    transform-origin: center;
    transform-box: fill-box;
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
</style>
