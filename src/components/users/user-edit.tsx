import { MerchantUserGetOutput, PersonRole } from "@backpack-fux/pylon-sdk";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Select, SelectItem } from "@nextui-org/select";
import { useState } from "react";

interface UserEditModalProps {
  isOpen: boolean;
  user: MerchantUserGetOutput;
  isSelf: boolean;
  isEditable: boolean;
  availableRoles: PersonRole[];
  onClose: () => void;
  onSave: (updatedUser: MerchantUserGetOutput) => void;
  onRemove: (userId: string) => void;
}

export default function UserEditModal({
  isOpen,
  user,
  isSelf,
  isEditable,
  availableRoles,
  onClose,
  onSave,
  onRemove,
}: UserEditModalProps) {
  const [editedUser, setEditedUser] = useState<MerchantUserGetOutput>({ ...user });
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleSave = () => {
    onSave(editedUser);
    onClose();
  };

  const handleRemove = () => {
    onRemove(fullName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Edit {fullName}</ModalHeader>
        <ModalBody>
          <Input
            label="First Name"
            value={editedUser.firstName}
            onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            value={editedUser.lastName}
            onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
          />
          <Input
            label="Username"
            value={editedUser.username || ""}
            onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
          />
          <Input
            label="Email"
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={editedUser.phone || ""}
            onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
          />
          <Select
            label="Role"
            selectedKeys={[editedUser.role]}
            onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as PersonRole })}
          >
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </SelectItem>
            ))}
          </Select>
          {/* <Switch
            classNames={{ wrapper: "bg-ualert-500" }}
            isSelected={editedUser.status === "Active"}
            onValueChange={(isActive) =>
              setEditedUser({
                ...editedUser,
                status: isActive ? "Active" : "Inactive",
              })
            }
          >
            {editedUser.status === "Active" ? "Active" : "Suspended"}
          </Switch> */}
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-ualert-500 text-notpurple-500"
            isDisabled={isSelf || !isEditable}
            onPress={() => setIsRemoveConfirmOpen(true)}
          >
            Remove User
          </Button>
          <Button onPress={onClose}>Cancel</Button>
          <Button color="primary" isDisabled={!isEditable} onPress={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* Confirmation Modal for Remove User */}
      <Modal isOpen={isRemoveConfirmOpen} onClose={() => setIsRemoveConfirmOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirm Removal</ModalHeader>
          <ModalBody>Are you sure you want to remove {fullName}? This action cannot be undone.</ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsRemoveConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-ualert-600 text-notpurple-500" onPress={handleRemove}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}
