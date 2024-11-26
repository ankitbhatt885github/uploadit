"use client"
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortTypes } from '@/constants';
import { usePathname, useRouter } from "next/navigation";


//sort types is defined in constants
const Sort = () => {
  const path = usePathname();
  const router = useRouter();

  const handleSort = (value: string) => {
    router.push(`${path}?sort=${value}`);
  };
  return (

    //sortTypes[0] is by default means: $createdAt-desc
    <Select onValueChange={handleSort} defaultValue={sortTypes[0].value}>
    <SelectTrigger className="sort-select">
      <SelectValue placeholder={sortTypes[0].value} />
    </SelectTrigger>
    <SelectContent >
      {/* sort types is defined in constants with all possible sorting  */}
      {sortTypes.map((sort) => (
        <SelectItem
          key={sort.label}
          className="shad-select-item"
          value={sort.value}
        >
          {sort.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  )
}

export default Sort