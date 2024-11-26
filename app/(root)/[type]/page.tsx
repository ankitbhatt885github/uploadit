import Sort from '@/components/Sort';
import { Models } from 'node-appwrite';
import React from 'react'
import Card from '@/components/Card';
import { getFiles } from '@/lib/actions/file.actions';
import { getFileTypesParams } from '@/lib/utils';

const Page = async ({searchParams, params} : SearchParamProps) => {
    //extract type from params
    const type  = ((await params)?.type as string) || "";

    const searchText = ((await searchParams)?.query) as string || "";

    const sort = ((await searchParams)?.sort) as string || "";

    const types = getFileTypesParams(type) as FileType[];
    const files = await getFiles({types,searchText,sort});

    //display the value of type
  return (
    <div className='page-container'> 
    <section className='w-full'>
        
        <h1 className='text-[34px] leading-[42px] font-bold'>{type}</h1>
        
        <div className='total-size-section'>
            <p className='body-1'>
                Total: <span className='h5'> MB</span>
            </p>

            <div className='sort-container'>
                <p>Sort by: </p>
                <Sort />
            </div>
        </div>
        
        </section>
        {/* dynamically render the files  */}
         {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
            {/* each file is instance of Models.Document */}
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

        
 

export default Page