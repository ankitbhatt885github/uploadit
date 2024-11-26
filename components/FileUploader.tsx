"use client";

import React, { useCallback, useState } from "react";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import Thumbnail from "@/components/Thumbnail";

import { usePathname } from "next/navigation";
import { MAX_FILE_SIZE } from "@/constants";
import { uploadFile } from "@/lib/actions/file.actions";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const { toast } = useToast();
 
  const [files, setFiles] = useState<File[]>([]);



  //useCallback() in React is used to memoize functions so that they don’t get recreated on every render unless their dependencies change.
  const onDrop = useCallback(
    //onDrop runs when user selects file or drops it
    async (acceptedFiles: File[]) => {

      //add the files into acceptedFiles
      setFiles(acceptedFiles);


      //go to files one by one since there can be muliple files
      const uploadPromises = acceptedFiles.map(async (file) => {

        //if size is more than 50mb don't upload it
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );

        
          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        //upload files if valid
        return uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            //if uploaded so return it from bottom right corner modal
            if (uploadedFile) {
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name),
              );
              //Removes the file from the list once uploaded also UI is re-rendered 
            }
          },
        );
      });

      //wait for all the files
      await Promise.all(uploadPromises);
    },
    //only works when any of the dependancy changes
    [ownerId, accountId, path],
  );

//whenever files are dropped or selected we run the onDrop function
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />{" "}
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;