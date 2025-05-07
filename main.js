window.onload = () => {
  carregarVagas();
};

async function carregarVagas() {
  try {
    const { data: vagas } = await axios.get("http://localhost:3000/jobs");
    mostrarVagas(vagas);
  } catch (err) {
    mostrarErro("Erro ao carregar vagas!");
  }
}

function mostrarVagas(vagas) {
  const container = document.getElementById("job-list");
  container.innerHTML = vagas
    .map(
      (vaga) => `
      <div class="col-md-4 mb-4">
        <div class="card border-info shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${vaga.title}</h5>
            <p class="card-text"><strong>Empresa:</strong> ${vaga.company}</p>
            <p class="card-text">
              <span class="badge rounded-pill bg-info text-muted">
                ${vaga.location || "Não informado"}
              </span>
            </p>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function carregarCandidatos() {
  axios
    .get("http://localhost:3000/users")
    .then((res) => mostrarCandidatos(res.data))
    .catch(() => mostrarErro("Erro ao carregar candidatos!"));
}

function mostrarCandidatos(candidatos) {
  const container = document.getElementById("candidates");
  container.innerHTML = candidatos
    .map(
      (user) => `
    <div class="col-md-4 mb-3">
      <div class="card border-primary shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${user.email}</h6>
          <div class="mt-3">
            <button class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario('editar', '')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirUsuario('')">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    `
    )
    .join("");
}

let candidatosVisiveis = false;
function alternarCandidatos() {
  const container = document.getElementById("candidates");
  candidatosVisiveis = !candidatosVisiveis;
  container.style.display = candidatosVisiveis ? "flex" : "none";
  if (candidatosVisiveis) carregarCandidatos();
}
window.toggleCandidates = alternarCandidatos;

function mostrarErro(msg) {
  Swal.fire("Erro", msg, "error");
}
