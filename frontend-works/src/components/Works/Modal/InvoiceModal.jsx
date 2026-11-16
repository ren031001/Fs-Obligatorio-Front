import Modal from "react-modal";
import InvoiceForm from "../Form/InvoiceForm";
import "./InvoiceModal.css";

Modal.setAppElement("#root");

const InvoiceModal = ({ isOpen, onRequestClose, obra, onSave, onAnalyze }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Factura de la obra"
      className="editar-obra-modal"
      overlayClassName="editar-obra-overlay"
    >
      <InvoiceForm
        obra={obra}
        onSave={onSave}
        onAnalyze={onAnalyze}
        onCancel={onRequestClose}
      />
    </Modal>
  );
};

export default InvoiceModal;
