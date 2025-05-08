window.onload = () => {
  carregarVagas();

  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
    });
  });

  const candidatosVisiveis = localStorage.getItem("candidatosVisiveis");
  if (candidatosVisiveis) {
    const container = document.getElementById("candidates");
    container.style.display = "flex";
    carregarCandidatos();
  }
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
  const container = document.getElementById("candidates");
  container.style.display = "flex";
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
            <button type="button" class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario('editar', '${user.id}')">Editar</button>
            <button type="button" class="btn btn-sm btn-danger" onclick="excluirUsuario('${user.id}')">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    `
    )
    .join("");
}

function abrirModalUsuario(acao, id = null) {
  const titulo = acao == "editar" ? "Editar Candidato" : "Novo Candidato";
  const exibirFormulario = (name = "", email = "", id = null) => {
    Swal.fire({
      title: titulo,
      html: `
        <input id="swal-nome" class="swal2-input" placeholder="Nome" value="${name}">
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${email}">
      `,
      confirmButtonText: "Salvar",
      focusConfirm: false,
      showCloseButton: true,
      alllowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        const btn = Swal.getConfirmButton();
        btn.setAttribute("type", "button");
      },
      preConfirm: () => {
        const name = document.getElementById("swal-nome").value.trim();
        const email = document.getElementById("swal-email").value.trim();

        if (!name || !email) {
          Swal.showValidationMessage("Preencha todos os campos");
          return false;
        }

        return { name, email }; // Retorna os dados que serão enviados ao backend
      },
    }).then((result) => {
      console.log("Resultado: ", result);
      if (!result.isConfirmed) return;
      const url = id
        ? `http://localhost:3000/users/${id}`
        : `http://localhost:3000/users/`;
      const metodo = id ? axios.put : axios.post;

      metodo(url, result.value)
        .then(() => {
          Swal.fire({
            title: "Sucesso",
            text: `Candidato ${id ? "atualizado" : "cadastrado"}!`,
            icon: "success",
            timer: 9000,
            showConfirmButton: false,
          });
        })
        .then(() => {
          carregarCandidatos();
        })
        .catch(() => {
          mostrarErro("Não foi possível salvar!");
        });
    });
  };

  if (acao === "editar" && id) {
    axios
      .get(`http://localhost:3000/users/${id}`)
      .then((res) => exibirFormulario(res.data.name, res.data.email, id))
      .catch(() => mostrarErro("Usuário não encontrado!"));
  } else {
    exibirFormulario("", "", null);
  }
}

window.createUser = () => abrirModalUsuario("novo");

function alternarCandidatos() {
  const container = document.getElementById("candidates");
  const visivel = container.style.display === "flex";
  if (visivel) {
    container.style.display = "none";
    localStorage.setItem("candidatosVisiveis", false);
  } else {
    container.style.display = "flex";
    localStorage.setItem("candidatosVisiveis", true);
    carregarCandidatos();
  }
}

function toggleCandidates() {
  alternarCandidatos();
}

function excluirUsuario(id) {
  Swal.fire({
    title: "Tem certeza?",
    text: "Essa ação não poderá ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, excluir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (!result.isConfirmed) return;
    axios
      .delete(`http://localhost:3000/users/${id}`)
      .then(() => {
        Swal.fire({
          title: "Excluído",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .then(() => {
        carregarCandidatos();
      })
      .catch(() => mostrarErro("Não foi possível excluir!"));
  });
}

function mostrarErro(msg) {
  Swal.fire("Erro", msg, "error");
}
