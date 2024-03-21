<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = [];
  let commits = [];
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
  let xAxis, yAxis;
  let yAxisGridlines;
  let hoveredIndex = -1;
  $: hoveredCommit = commits[hoveredIndex] ?? {};

  $: {
    d3.select(xAxis).call(d3.axisBottom(xScale));
    // d3.select(yAxis).call(d3.axisLeft(yScale));
    d3.select(yAxis).call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00")
    );
  }

  $: {
    d3.select(yAxisGridlines).call(
      d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
    );
  }

  $: workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => d.datetime.toLocaleString("en", { dayPeriod: "short" })
  );
  $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log("data", data);
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

        // Like ret.lines = lines
        // but non-enumerable so it doesn’t show up in JSON.stringify
        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });
    console.log("commits", commits);
  });
</script>

<h1>Meta</h1>
<svelte:head>
  <title>Meta</title>
</svelte:head>

<svg viewBox="0 0 {width} {height}">
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />

  <g class="dots">
    {#each commits as commit, index}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r="5"
        fill="steelblue"
      />
    {/each}
  </g>
  <!-- Other attributes/directives not shown for brevity -->
  <circle
    on:mouseenter={(evt) => (hoveredIndex = index)}
    on:mouseleave={(evt) => (hoveredIndex = -1)}
  />
</svg>

<h2>Stats</h2>
<section>
  {#if profileData}
    <dl class="stats">
      <div>
        <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
        <dd>{data.length}</dd>
      </div>

      <div>
        <dt><b>Commits</b></dt>
        <dd>{commits.length}</dd>
      </div>
      <div>
        <dt><b>Files</b></dt>
        <dd>{d3.group(data, (d) => d.file).size}</dd>
      </div>
      <div>
        <dt><b>Time of Day most work is done</b></dt>
        <dd>{maxPeriod}</dd>
      </div>
      <div id="commit-tooltip" class="info tooltip">
        <dt>Commit</dt>
        <dd>
          <a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a>
        </dd>
      </div>
      <div>
        <dt>Date</dt>
        <dd>
          {hoveredCommit.datetime?.toLocaleString("en", { date: "full" })}
        </dd>
      </div>
      <div>
        <dt>Time</dt>
        <dd>
          {hoveredCommit.datetime?.toLocaleString("en", { time: "full" })}
        </dd>
      </div>
      <div>
        <dt>Author</dt>
        <dd>
          {hoveredCommit.datetime?.toLocaleString("en", { author: "full" })}
        </dd>
      </div>
      <!-- problematic -->
      <div>
        <dt>Lines edited</dt>
        <dd>
          {hoveredCommit.datetime?.toLocaleString("en", { totalLines: "full" })}
        </dd>
      </div>
    </dl>
  {:else}
    <p>Nothing to show...</p>
  {/if}
</section>

<style>
  section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  dl {
    display: contents;
  }

  dt,
  dd {
    grid-row: 1 / span 2;
    padding: 5px;
  }
  svg {
    overflow: visible;
  }
  .gridlines {
    stroke-opacity: 0.2;
  }
  dl.info {
    display: grid;
  }
  .tooltip {
    position: fixed;
  }
  circle {
    transition: 200ms;

    &:hover {
      transform: scale(1.5);
    }
    transform-origin: center;
    transform-box: fill-box;
  }
</style>
