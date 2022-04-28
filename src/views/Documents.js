import React, { useState, useEffect } from 'react';
import {
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CDataTable,
    CRow,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter ,
    CFormGroup,
    CLabel,
    CTextarea,
    CInput
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

import useApi from '../services/api';

export default () => {
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTitleField, setModalTitleField] = useState('');
  const [modalBodyField, setModalBodyField] = useState('');
  const [modalId, setModalId] = useState('');

  const fields= [
    {label: 'Título', key: 'title'},
    {label: 'Ações', key: 'actions', _style:{width:'1px'}}
  ];

  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    setLoading(true);
    const result = await api.getDocuments();
    setLoading(false);
    if(result.error === '') {
      setList(result.list);
    } else {
      alert(result.error);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handleEditButton = (index) => {
    setModalId(list[index]['id']);
    setModalTitleField(list[index]['title']);
    setModalBodyField(list[index]['body']);
    setShowModal(true);
  }

  const handleRemoveButton = async (index) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      const result = await api.removeWall(list[index]['id']);
      if(result.error === '') {
        getList();
      } else {
        alert(result.error);
      }
    }
  }

  const handleNewButton = () => {
    setModalId('');
    setModalTitleField('');
    setModalBodyField('');
    setShowModal(true);
  }

  const handleModalSave = async () => {

    if (modalTitleField && modalBodyField) {
        setModalLoading(true);
        let result;

        let data = {
          title: modalTitleField,
          body: modalBodyField
        };

        if (modalId === '') {
          result = await api.addWall(data);
        } else {
          result = await api.updateWall(modalId, data);
        }

        setModalLoading(false);
        if(result.error === '') {
            setShowModal(false);
            getList();
        } else {
            alert(result.error);
        }
    } else {
        alert('Preencha os campos!');
    }

  }

  const handleDownloadButton = (index) => {
    window.open(list[index]['fileurl']);
  }

  return (
    <>
      <CRow>
        <CCol>
          <h2>Documentos</h2>

          <CCard>
            <CCardHeader>
              <CButton color="primary" onClick={handleNewButton}>
                <CIcon name="cil-check" /> Novo Documento
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CDataTable
                items={list}
                fields={fields}
                loading={loading}
                noItemsViewSlot=" "
                hover
                striped
                bordered
                pagination
                itemsPerPage={5}
                scopedSlots={{
                  'actions': (item, index) => (
                    <td>
                      <CButtonGroup>
                        <CButton color='success' onClick={() => handleDownloadButton(index)}>
                          <CIcon name='cli-cloud-download' />
                        </CButton>
                        <CButton color="info" onClick={() => handleEditButton(index)}>Editar</CButton>
                        <CButton color='danger' onClick={() => handleRemoveButton(index)}>Excluir</CButton>
                      </CButtonGroup>
                    </td>

                  )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>


      <CModal show={showModal} onClose={handleCloseModal}>
        <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Aviso</CModalHeader>
        <CModalBody>
            <CFormGroup>
                <CLabel htmlFor="modal-title">Título do Aviso</CLabel>
                <CInput
                    type="text"
                    id="modal-title"
                    placeholder="Digite um título para o aviso"
                    value={modalTitleField}
                    onChange={e => setModalTitleField(e.target.value)}
                    disabled={modalLoading}
                />
            </CFormGroup>
            <CFormGroup>
                <CLabel htmlFor="modal-body">Corpo do Aviso</CLabel>
                <CTextarea
                    id="modal-body"
                    placeholder="Digite o conteúdo do aviso"
                    value={modalBodyField}
                    onChange={e => setModalBodyField(e.target.value)}
                    disabled={modalLoading}
                />
            </CFormGroup>
        </CModalBody>
        <CModalFooter>
            <CButton
                color="primary"
                onClick={handleModalSave}
                disabled={modalLoading}
            >
              {modalLoading ? 'Carregando...' : 'Salvar'}
            </CButton>
            <CButton
                color="secondary"
                onClick={handleCloseModal}
                disabled={modalLoading}
            >Cancelar</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}
