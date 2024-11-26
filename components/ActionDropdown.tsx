"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

  import { useState } from "react";
  import Image from "next/image";
  import { Models } from "node-appwrite";
  import { actionsDropdownItems } from "@/constants";
  import Link from "next/link";
  import { constructDownloadUrl } from "@/lib/utils";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import {
    
    deleteFile,
    renameFile,
    updateFileUsers,
     
  } from "@/lib/actions/file.actions";
  import { usePathname } from "next/navigation";
import { FileDetails } from './ActionsModalContent';
import { ShareInput } from './ActionsModalContent';

  const ActionDropdown = ({ file }: { file: Models.Document }) =>  {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [action, setAction] = useState<ActionType | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    //to rename file name
    const [name, setName] = useState(file.name);
    const [emails, setEmails] = useState<string[]>([]);

    //is used to get the current URL of the page 
    const path = usePathname();

    const closeAllModals = () => {
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        setAction(null);
        //reset the name to what it was
        setName(file.name);
        
      };

      const handleRemoveUser = async (email: string) => {
        const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();

      }

      const handleAction = async () => {
        if (!action) return;
        setIsLoading(true);
        let success = false;
    
        const actions = {
          rename: () =>
            renameFile({ fileId: file.$id, name, extension: file.extension, path }),
          share: () => updateFileUsers({ fileId: file.$id, emails, path }),
          delete: () =>
            deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
        };
    
        

        if (action.value === "rename") {
          success = await actions.rename();
        } else if (action.value === "share") {
          success = await actions.share();
        } else if (action.value === "delete") {
          success = await actions.delete();
        }
    
        if (success) closeAllModals();
    
        setIsLoading(false);
      };
    
    const renderDialogContent = () => {
        if (!action) return null;
    
        const { value, label } = action;
    
        return (

            //create different dialog content for fields but there will be 2 buttons below it always
          <DialogContent className="shad-dialog button">
            <DialogHeader className="flex flex-col gap-3">
              <DialogTitle className="text-center text-light-100">
                {label}
              </DialogTitle>
              {/* for rename render the input field  */}
              {value === "rename" && (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
               {value === "details" && <FileDetails file={file} />}
              {value === "share" && (
                <ShareInput
                  file={file}
                  onInputChange={setEmails}
                  onRemove={handleRemoveUser}
                />
              )} 
              {value === "delete" && (
                <p className="delete-confirmation">
                  Are you sure you want to delete{` `}
                  <span className="delete-file-name">{file.name}</span>?
                </p>
              )}
            </DialogHeader>
            {/* if rename, delete or share is selected  */}
            {["rename", "delete", "share"].includes(value) && (
                //give two buttons Cancel and the second one will be out of the three values whatever is selected
              <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button onClick={closeAllModals} className="modal-cancel-button">
                  Cancel
                </Button>
                <Button onClick={handleAction} className="modal-submit-button">
                  <p className="capitalize">{value}</p>
                  {isLoading && (
                    <Image
                      src="/assets/icons/loader.svg"
                      alt="loader"
                      width={24}
                      height={24}
                      className="animate-spin"
                    />
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        );
      };
    
    
  return (
   

   
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  )
}

export default ActionDropdown