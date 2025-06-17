import React, { useEffect, useRef } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import slugify from 'slugify'
import { showToast } from '@/helpers/showToast'
import { getEnv } from '@/helpers/getEnv'

const AddCategory = () => {
//     const hasAutoAdded = useRef(false)

    const formSchema = z.object({
        name: z.string().min(3, 'Name must be at least 3 character long.'),
        slug: z.string().min(3, 'Slug must be at least 3 character long.'),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    })

    const categoryName = form.watch('name')

    useEffect(() => {
        if (categoryName) {
            const slug = slugify(categoryName, { lower: true })
            form.setValue('slug', slug)
        }
    }, [categoryName])

//     useEffect(() => {
//         if (!hasAutoAdded.current) {
//             hasAutoAdded.current = true;
//             async function autoAdd() {
//                 try {
//                     const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/category/all-category`, {
//                         method: 'get',
//                         credentials: 'include'
//                     });
//                     const data = await response.json();
//                     console.log('Fetched categories:', data);
//                     if (data.category && data.category.length === 0) {
//                         const defaultCategories = [
//                             { name: 'General', slug: 'general' },
//                             { name: 'Technology', slug: 'technology' },
//                             { name: 'Health', slug: 'health' },
//                             { name: 'Travel', slug: 'travel' },
//                             { name: 'Education', slug: 'education' }
//                         ];
//                         for (const cat of defaultCategories) {
//                             const addRes = await fetch(`${getEnv('VITE_API_BASE_URL')}/category/add`, {
//                                 method: 'post',
//                                 headers: { 'Content-type': 'application/json' },
//                                 body: JSON.stringify(cat)
//                             });
//                             const addData = await addRes.json();
//                             console.log('Add category response:', addData);
//                         }
//                         setTimeout(() => window.location.reload(), 1500);
//                     }
//                 } catch (e) { console.log('Auto add error:', e); }
//             }
//             autoAdd();
//         }
//     }, []);

    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/category/add`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(values)
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            form.reset()
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    return (
        <div>
            <Card className="pt-5 max-w-screen-md mx-auto">
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}  >
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </Form>

                </CardContent>
            </Card>

        </div>
    )
}

export default AddCategory