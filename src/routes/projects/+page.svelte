<script>
  import projects from "$lib/projects.json";
  import Project from "$lib/Project.svelte";
  import Pie from "$lib/Pie.svelte";
  import * as d3 from "d3";

  let pieData;
  let query = "";
  let filteredProjects;
  let selectedYearIndex = -1;
  let selectedYear;
  let filteredByYear;

  // MAKE THE SEARCH CASE-INSENSITIVE
  $: filteredProjects = projects.filter((project) => {
    if (query) {
      return project.title.toLowerCase().includes(query.toLowerCase());
    }

    return true;
  });

  // SEARCH ACROSS ALL PROJECT METADATA, NOT JUST TITLES
  $: filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // CALCULATE pieData BASED ON filteredProjects
  $: {
    let rolledData = d3.rollups(
      filteredProjects,
      (v) => v.length,
      (d) => d.year
    );
    pieData = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  }

  $: selectedYear =
    selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

  $: {
    filteredByYear = filteredProjects.filter((project) => {
      return selectedYear ? project.year === selectedYear : true;
    });
  }
</script>

<h1>{filteredProjects.length} Projects</h1>
<svelte:head>
  <title>Projects</title>
</svelte:head>

<input
  type="search"
  bind:value={query}
  aria-label="Search projects"
  placeholder="🔍 Search projects…"
/>

<div class="projects">
  {#each filteredByYear as p}
    <Project info={p} />
  {/each}
</div>

<Pie data={pieData} bind:selectedIndex={selectedYearIndex} />

<style>
  input[type="search"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    outline: none;
  }

  input[type="search"]:focus {
    border-color: #007bff;
  }

  input[type="search"]::placeholder {
    color: #999;
  }
</style>
