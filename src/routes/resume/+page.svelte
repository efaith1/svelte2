<h1>Resume</h1>
<svelte:head>
  <title>Resume</title>
</svelte:head>
<!-- header anywhere; section, then article beneath -->

<div class="resume-container">
  <header>
    <h2 class="resumeName">Esther F. Willowitz</h2>
    <h2 class="resumeName">305 Wachusetts Ave, Scranton, PA 02239</h2>
  </header>

  <section>
    <h2>Experience</h2>
    <article>
      <header>
        <h3>SWE @ Duckface</h3>
        <i><time>January 2023 - Present</time></i>
      </header>
      <p>Revamped the entire company. Sales went up 8000%.</p>
    </article>
  </section>

  <section>
    <h2>Education</h2>
    <article>
      <header>
        <h3>Bachelor of Science in Computer Science</h3>
        <i><time>Class of 2022</time></i>
      </header>
      <p>University of Oxford, Oxford, Isle of Man</p>
    </article>
    <article>
      <header>
        <h3>High School Diploma</h3>
        <i><time>Class of 2018</time></i>
      </header>
      <p>Gilmore Girls, Haven, CT</p>
    </article>
  </section>

  <section>
    <h2>Skills</h2>
    <ul>
      <li>Minimal humor</li>
      <li>HTML5</li>
      <li>CSS3</li>
      <li>JavaScript</li>
    </ul>
  </section>

  <footer>
    <p>
      Get in touch: <a href="mailto:your@email.com">cantouchthis101@duck.com</a>
    </p>
  </footer>
</div>
