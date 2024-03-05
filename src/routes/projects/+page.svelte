<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
</script>

<h1>{projects.length} Projects </h1>
<svelte:head>
    <title>Projects</title>
</svelte:head>

<div class="projects">
    {#each projects as p}
        <Project info={p} />        
    {/each}
</div>
