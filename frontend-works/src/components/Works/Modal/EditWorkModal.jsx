import Modal from "react-modal";
import EditWorkForm from "../Form/EditWorkForm";
import "./EditWorkModal.css";

Modal.setAppElement("#root");

const EditWorkModal = ({
  isOpen,
  onRequestClose,
  obra,
  onSave,
  onUploadImage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Editar obra"
      className="editar-obra-modal"
      overlayClassName="editar-obra-overlay"
    >
      <EditWorkForm
        obra={obra}
        onSave={onSave}
        onUploadImage={onUploadImage}
        onCancel={onRequestClose}
      />
    </Modal>
  );
};

export default EditWorkModal;
