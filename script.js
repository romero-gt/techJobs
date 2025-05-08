window.onload = () => {
    carregarVagas()
};

async function carregarVagas () {
    try{       
        const { data: vagas } = await axios.get('http://localhost:3000/jobs');   
        mostrarVagas(vagas);
    } catch (error) {
        mostrarErro('Erro ao carregar as vagas. Tente novamente mais tarde.');
    }
}

function mostrarVagas(vagas) {
  const container = document.getElementById("job-list");
  container.innerHTML = vagas.map(vaga => 
    `                          
   <div class="col-md-4 mb-4">
      <div class="card border-info shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${vaga.title}</h5>
          <p class="card-text"><strong>Empresa:</strong> ${vaga.company}</p>
          <p class="card-text">
            <span class="badge rounded-pill bg-info text-muted">
              ${vaga.location || 'Não informado'}
            </span>
          </p>
        </div>
      </div>
    </div>
  `).join('');
}

function abrirModalVaga(acao, id = null) {
  const titulo = acao == 'editar' ? 'Editar Vaga' : 'Nova Vaga';
  const exibirFormulario = (title = '', company = '', location = '') => {
    swal.fire ({
      title: titulo,
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Título" value="${title}">
        <input id="swal-company" class="swal2-input" placeholder="Empresa" value="${company}">
        <input id="swal-location" class="swal2-input" placeholder="Localização" value="${location}">
      `,
      confirmButtonText: 'Salvar',
      focusConfirm: false,
      preConfirm: () => {
        const title = document.getElementById('swal-title').value.trim();
        const company = document.getElementById('swal-company').value.trim(); 
        const location = document.getElementById('swal-location').value.trim();
        if (!title || !company) {
          Swal.showValidationMessage('Preencha todos os campos');
          return false;
        }
        return { title, company, location }; // Retorna os dados que SERÃO enviados ao backend
      }
  }).then(result => {
      if (!result.isconfirmed) return;

      const url = id ? `http://localhost:3000/jobs/${id}` : `http://localhost:3000/jobs/`;
      const metodo = id ? axios.put : axios.post;

      metodo(url, result.value)
        .then(() => {
          Swal.fire('Sucesso', `Vaga ${id ? 'atualizada' : 'cadastrada'}!`, 'success');
          carregarVagas();
        }).catch(() => {
          mostrarErro('Não foi possível salvar.');
        });
    });
 }

 if (acao === 'editar' && id) {
    axios.get(`http://localhost:3000/jobs/${id}`)
      .then(res => exibirFormulario(res.data.title, res.data.company, res.data.location))
      .catch(() => mostrarErro('Vaga não encontrada!'));
  }
  else {
    exibirFormulario();
  }
}
window.createJob = () => abrirModalVaga('novo');


function carregarCandidatos() {
    axios.get('http://localhost:3000/users')
      .then(res => mostrarCandidatos(res.data))
      .catch(() => mostrarErro('Erro ao carregar os candidatos. Tente novamente mais tarde.'));
}

function mostrarCandidatos(candidatos) {
    const container = document.getElementById('candidates');
    container.innerHTML = candidatos.map(user => `
      <div class="col-md-4 mb-3">
        <div class="card border-primary shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${user.name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${user.email}</h6>
              <div class="mt-3">
                <button class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario('editar', '')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="excluirUsuario('${user.id}')">Excluir</button>
              </div>
          </div>
        </div>
      </div>`
    ).join("");  
}

function abrirModalUsuario(acao, id = null) {
  const titulo = acao == 'editar' ? 'Editar Candidato' : 'Novo Candidato';

  const exibirFormulario = (name = '', email = '') => {
    Swal.fire({
      title: titulo,
      html: `
        <input id="swal-nome" class="swal2-input" placeholder="Nome" value="${name}">
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${email}">
      `,
      confirmButtonText: 'Salvar',
      showcloseButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-nome').value.trim();
        const email = document.getElementById('swal-email').value.trim();

        if(!name || !email) {
          Swal.showValidationMessage('Preecha todos os campos');
          return false;
        }

        return {name, email}; //Retorna os dados que SERÃO enviados ao backend
      }
    }).then(result => {
      if(!result.isConfirmed) return;

      const url = id ? `http://localhost:3000/users/${id}` : `http://localhost:3000/users/`;
      const metodo = id ? axios.put : axios.post;

      metodo(url, result.value)
        .then(() => {
          Swal.fire('Sucesso', `Candidato ${id ? 'atualizado' : 'cadastrado'}!`, 'success');
          carregarCandidatos();
      }).catch(() => {
        mostrarErro('Não foi possível salvar.');
      });
    });
  }

  if (acao === 'editar' && id) {
    axios.get(`http://localhost:3000/users/${id}`)
      .then(res => exibirFormulario(res.data.name, res.data.email))
      .catch(() => mostrarErro('Usuário não encontrado!'));
  } else {
    exibirFormulario();
  }
}
window.createUser = () => abrirModalUsuario('novo');


let candidatosVisiveis = false;
function alternarCandidatos() {
  const container = document.getElementById('candidates');
  candidatosVisiveis = !candidatosVisiveis; //toggle (liga/desliga)
  container.style.display = candidatosVisiveis ? 'flex' : 'none';
  if (candidatosVisiveis) carregarCandidatos();
}
window.toggleCandidates = alternarCandidatos;

function excluirUsuario(id) {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação não poderá ser desfeita!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if(!result.isConfirmed) return;

    axios.delete(`http://localhost:3000/users/${id}`)
      .then(() => {
        Swal.fire('Excluído!', 'Candidato Removido.', 'success');
        carregarCandidatos();
      })
      .catch(() => mostrarErro('Não foi possível excluir!'));
  });
}


function mostrarErro(msg) {
   Swal.fire('Erro', msg, 'error');
}

