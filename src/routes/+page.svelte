<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";
    </script>

<h1>Esther F.</h1>
<img src="images/me.jpg" alt="A photo of me smiling really hard" width="260" height="300">
<p> I am a Junior from Nairobi majoring in Computer Science. Nice to meet you!</p>

<h1> <u>Latest projects</u></h1>

<div class="projects highlights">
    {#each projects.slice(0, 3) as project}
        <Project info={project} hLevel={3} />
    {/each}
</div>