document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-pesquisa");
  const resultadoDiv = document.querySelector("#resultado");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pais = document.querySelector("#pais").value.trim();
    if (!pais) {
      resultadoDiv.innerHTML = "<p>Insira um país válido.</p>";
      return;
    }

    try {
      const response = await fetch(`/pesquisa/${encodeURIComponent(pais)}`);
      if (!response.ok) {
        resultadoDiv.innerHTML = "<p>Erro ao buscar informações do país.</p>";
        return;
      }

      const data = await response.json();

      resultadoDiv.innerHTML = `
      <h2>${data.nome}</h2>
      <img src="${data.bandeira}" alt="Bandeira de ${data.nome}" width="150"/>
      <p><strong>Capital:</strong> ${data.capital}</p>
      <p><strong>População:</strong> ${data.populacao.toLocaleString()}</p>

      ${data.tempo ? `
        <h3>Tempo atual em ${data.capital}</h3>
        <p>
          <img src="https://openweathermap.org/img/wn/${data.tempo.atual.icone}@2x.png" alt="${data.tempo.atual.descricao}" />
          ${data.tempo.atual.descricao}, ${data.tempo.atual.temperatura} °C
        </p>

        <h3>Previsão (Próximas horas)</h3>
        <ul>
          ${data.tempo.previsao.map(item => `
            <li>
              ${item.data}: 
              ${item.temp} °C, ${item.descricao}
              <img src="https://openweathermap.org/img/wn/${item.icone}@2x.png" alt="${item.descricao}" width="32"/>
            </li>
          `).join('')}
        </ul>
      ` : '<p>Sem dados de tempo disponíveis.</p>'}
    `;
    } catch (err) {
      console.error("Erro:", err);
      resultadoDiv.innerHTML = "<p>Erro na ligação com o servidor.</p>";
    }
  });

  const logoutBtn = document.querySelector("#logout-btn");
  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/logout");
      if (res.redirected) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  });
});
