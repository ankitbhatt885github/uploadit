import Header from '@/components/Header'
import MobileNavigation from '@/components/MobileNavigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from '@/components/ui/toaster'

//relies on cookies makes the page render on each req
export const dynamic = "force-dynamic";


const Layout = async ({ children }: { children: React.ReactNode }) => {

    const currentUser = await getCurrentUser();

    if(!currentUser) return redirect("/sign-in")
  return (
   <main className='flex h-screen'>
    {/* pass important values as props  */}
    <Sidebar fullName={currentUser.fullName} avatar={currentUser.avatar} email={currentUser.email}/>
    <section className='flex h-full flex-1 flex-col'>
        <MobileNavigation {...currentUser} /> <Header userId={currentUser.$id} accountId={currentUser.accountId}/> 
        <div className='main-content'>{children}</div>
    </section>
    <Toaster />
   </main>
  )
}

export default Layout