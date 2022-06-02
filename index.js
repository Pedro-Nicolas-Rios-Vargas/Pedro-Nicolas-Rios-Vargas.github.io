const form = document.getElementById('formulario');
const main = document.getElementsByTagName('main')[0];
const tableHead = document.getElementsByTagName('thead')[0];
const tableBody = document.getElementsByTagName('tbody')[0];
const resultsContainer = document.getElementById('results-container');
const resultSpan = document.getElementById('result');


function doResultContainerVisible() {
  if (resultsContainer.classList.contains('invisible')) {
    resultsContainer.classList.remove('invisible');
  }
}

function abortoDeTags(tagName) {
  const tag = document.getElementsByTagName(tagName)[0];

  if (tag.hasChildNodes()) {
    const childrens = Array.from(tag.childNodes);
    for (let children of childrens) {
      tag.removeChild(children);
    }
  }
}

function showResultMessage(success) {
  let message = '';
  let tagClass = '';
  if (success) {
    message = 'Exito';
    tagClass = 'exito';
  } else {
    message = 'Fracaso';
    tagClass = 'fracaso';
  }
  if (resultSpan.classList.contains('fracaso')) {
    if (tagClass != 'fracaso') {
      resultSpan.classList.remove('fracaso');
      resultSpan.classList.add(tagClass);
    }
  } else if (resultSpan.classList.contains('exito')) {
    if (tagClass != 'exito') {
      resultSpan.classList.remove('exito');
      resultSpan.classList.add(tagClass);
    }
  } else {
    resultSpan.classList.add(tagClass);
  }
  resultSpan.textContent = message;
}

function buildTableRow(cc, nuevo, meta, r, bh, header=false) {
  let columnTag = '';

  if (header) {
    columnTag = 'th';
  } else {
    columnTag = 'td';
  }

  let tableRow = document.createElement('tr');
  let columnCC = document.createElement(columnTag);
  let columnNuevo = document.createElement(columnTag);
  let columnMeta = document.createElement(columnTag);
  let columnR = document.createElement(columnTag);
  let columnBH = document.createElement(columnTag);

  const ccNode = document.createTextNode(cc);
  const nuevoNode = document.createTextNode(nuevo);
  const metaNode = document.createTextNode(meta);
  const rNode = document.createTextNode(r);
  const bhNode = document.createTextNode(bh);

  columnCC.appendChild(ccNode);
  columnNuevo.appendChild(nuevoNode);
  columnMeta.appendChild(metaNode);
  columnR.appendChild(rNode);
  columnBH.appendChild(bhNode);

  tableRow.appendChild(columnCC);
  tableRow.appendChild(columnNuevo);
  tableRow.appendChild(columnMeta);
  tableRow.appendChild(columnR);
  tableRow.appendChild(columnBH);

  return tableRow;
}

function buildTableHeader() {
  let nuevo = '';
  if (metodo == 'adelante') {
    nuevo = 'NH';
  } else {
    nuevo = 'NM';
  }

  let tableRow = buildTableRow('CC', nuevo, 'META', 'R', 'BH', true);

  // if (tableHead.hasChildNodes()) {
  //   const childrens = tableHead.childNodes;
  //   for (children of childrens) {
  //     tableHead.removeChild(children);
  //   }
  // }
  abortoDeTags(tableHead.nodeName)
  tableHead.appendChild(tableRow);
}

function buildBodyTable(cc, nuevo, meta, r, bh) {

  let strCC = '{';
  let strNuevo = '';
  let strBH = '{';
  let strR = '';
  for (let idx = 0; idx < cc.length; idx++) {
    let postfix = ', '

    if (idx > cc.length - 2) {
      postfix = ''
    }
    
    strCC += cc[idx].id + postfix;
  }
  strCC += '}';

  if (Array.isArray(nuevo)) {
    strNuevo = '{';
    strNuevo += nuevo.toString().replaceAll(',', ', ');
    strNuevo += '}';
  } else {
    strNuevo = nuevo;
  }

  strBH += bh.toString().replaceAll(',', ', ');
  strBH += '}';

  if (r) {
    strR = r.id;
  }
  let tableRow = buildTableRow(strCC, strNuevo, meta, strR, strBH);


  tableBody.appendChild(tableRow);
}

class Encadenamientos {
  constructor(reglas, bh, meta) {
    this.reglas = reglas;
    this.bh = bh;
    this.meta = meta;
    this.cc = [];
    this.r = '';
    doResultContainerVisible();
  }

  equipar() {
    const reglas2agregar = [];
    for (let regla of this.reglas) {
      let antecedentes = regla.antecedentes;
      let aceptado = false;
      for (let idx = 0; idx < antecedentes.length; idx++) {
        let antecedente = antecedentes[idx];
        if (this.bh.includes(antecedente)) {
          aceptado = true;
        } else {
          aceptado = false;
          break;
        }
      }
      if (aceptado) {
        reglas2agregar.push(regla);
        aceptado = false;
      }
    }
    for (let regla of reglas2agregar) {
      this.cc.push(regla);
      const reglaIdx = this.reglas.indexOf(regla);
      this.reglas.splice(reglaIdx, 1)
    }
  }

  equiparAtras(cc, meta) {
    const reglas2agregar = [];
    for (let regla of this.reglas) {
      let consecuente = regla.consecuente;
      if (consecuente == meta) {
        reglas2agregar.push(regla);
      }
    }
    for (let regla of reglas2agregar) {
      cc.push(regla);
      const reglaIdx = this.reglas.indexOf(regla);
      this.reglas.splice(reglaIdx, 1)
    }
  }

  haciaAdelante() {
    abortoDeTags(tableBody.nodeName);
    let nh = '';
    // TODO: Sustituir los console.log por filas de una tabla
    let tableHeader
    buildTableHeader();
    buildBodyTable(this.cc, nh, this.meta, this.r, this.bh);
    this.equipar();
    buildBodyTable(this.cc, nh, this.meta, this.r, this.bh);
    while (this.cc.length > 0 && !this.bh.includes(this.meta)) {
      // resolucion & eliminacion
      this.r = this.cc.shift();
      // Creación del nuevo hecho
      nh = this.r.consecuente
      // Actualizar base de hechos
      this.bh.push(nh);
      if (!this.bh.includes(this.meta)) {
        this.equipar();
      }
      buildBodyTable(this.cc, nh, this.meta, this.r, this.bh);
    }
    showResultMessage(this.bh.includes(this.meta));
    if (this.bh.includes(this.meta)) {
      console.log('Exito');
    } else {
      console.log('Fracaso');
    }
  }

  haciaAtras() {
    abortoDeTags(tableBody.nodeName);
    const evalAntecedentes = (regla) => {
      console.log(regla);
      let antecedentes = Array.from(regla.antecedentes);
      console.log(antecedentes);

      const antecNuevaMeta = [];
      for (let idx = 0; idx < antecedentes.length; idx++) {
        let antecedente = antecedentes[idx];
        if (!this.bh.includes(antecedente)) {
          antecNuevaMeta.push(antecedente);
        }/* else {
          break;
        }*/
      }
      return antecNuevaMeta;
    }

    const verificar = (meta, r='') => {
      let verificado = false;
      let nm = '';
      const cc = [];
      if (this.bh.includes(meta)) {
        verificado = true;
      } else {
        this.equiparAtras(cc, meta);
        // Actualiza la vista del conjunto CC
        buildBodyTable(cc, nm, meta, r, this.bh);
        while (cc.length > 0 && !verificado) {
          // Resolver & Eliminar
          r = cc.shift();
          nm = evalAntecedentes(r);
          console.log(nm);
          // Actualiza la vista del conjunto NM
          buildBodyTable(cc, nm, meta, r, this.bh);
          verificado = true;
          if (nm.length == 0) {
            this.bh.push(meta);
            r = '';
            meta = '';
          } else {
            while (nm.length > 0 && verificado) {
              let nueva_meta = nm.shift();
              buildBodyTable(cc, nm, meta, r, this.bh);
              verificado = verificar(nueva_meta, r);
              if (verificado && nm.length == 0) {
                this.bh.push(meta);
                r = '';
                meta = '';
              }
            }
          }
        }
        buildBodyTable(cc, nm, meta, r, this.bh);
      }

      return verificado;
    }

    buildTableHeader();
    let resultado = verificar(this.meta);
    showResultMessage(resultado);
    if (resultado) {
      console.log('Exito');
    } else {
      console.log('Fracaso');
    }
  }
}

function submitHandler(event) {
  const reglas = [];
  let id = '';
  let consecuente = '';
  let antecedentes = [];
  let lines = [];
  event.preventDefault();

  let data = new FormData(form);
  let rawReglas = data.get('BC').split('\n');
  let rawBH = data.get('BH');
  let rawMeta = data.get('Meta');
  metodo = data.get('metodo');

  for (const regla of rawReglas) {
    const reglaRegex = /(?<id>R[0-9]*): (?<antecedentes>(([A-Z]{1}) y )*([A-Z]{1})) -> (?<consecuente>[A-Z])/g;
    const matchRegla = reglaRegex.exec(regla);
    id = matchRegla.groups['id'];
    antecedentes = matchRegla.groups['antecedentes'].split(' y ');
    consecuente = matchRegla.groups['consecuente'];

    const reglaObj = {
      id,
      antecedentes,
      consecuente,
    };
    reglas.push(reglaObj);
  }

  const bhRegex = /^(([A-Z]{1}, )*([A-Z]{1}))$/g
  const matchBH = bhRegex.test(rawBH);
  if (matchBH) {
    bh = rawBH.split(', ');
  } else {
    // TODO: Agregar algo que notifique al usuario que la entrada de BH tiene
    // TODO: un mal formato
  }
  const metaRegex = /^[A-Z]$/g;
  const matchMeta = metaRegex.test(rawMeta);
  if (matchMeta) {
    meta = rawMeta;
  } else {
    // TODO: Agregar algo que notifique al usuario que la entrada de Meta tiene
    // TODO: un mal formato
  }

  let encadenamientos = new Encadenamientos(reglas, bh, meta);
  if (metodo == 'adelante') {
    // TODO: Ejecutar el metodo hacia adelante
    encadenamientos.haciaAdelante();
  } else if (metodo == 'atras') {
    // TODO: Ejecutar el metodo hacia atras
    encadenamientos.haciaAtras();
  }
}

form.addEventListener('submit', submitHandler);
