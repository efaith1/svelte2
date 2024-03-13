<script>
    import projects from '$lib/projects.json';
    import Project from "$lib/Project.svelte";

    let profileData; 
  
    // Fetching data from GitHub API
    fetchProfileData();
  
    async function fetchProfileData() {
      try {
        let response = await fetch("https://api.github.com/users/efaith1");
        if (response.ok) {
          profileData = await response.json();
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error(error);
      }
    }
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
  
<h2>GitHub Profile Stats</h2>
  <section>    
    {#if profileData}
      <dl>
        <div>
          <dt><b>Followers</b></dt>
          <dd>{profileData.followers}</dd>
        </div>
        <div>
            <dt><b>Following</b></dt>
            <dd>{profileData.following}</dd>
          </div>
        <div>
            <dt><b>Public Repos</b></dt>
            <dd>{profileData.public_repos}</dd>
          </div>
        <div>
            <dt><b>Public GISTS</b></dt>
            <dd>{profileData.public_gists}</dd>
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
  
    dt, dd {
      grid-row: 1 / span 2;
      padding: 5px;
    }
  </style>
  