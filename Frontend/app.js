fetch("/api/intelligence")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("feed");

    data.forEach(article => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${article.title}</h3>
        <p>Score: ${article.score} | ${article.tier} | ${article.sector}</p>
      `;
      container.appendChild(div);
    });
  });