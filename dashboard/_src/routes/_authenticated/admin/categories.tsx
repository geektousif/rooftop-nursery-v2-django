import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { LogInIcon } from 'lucide-react'
import { z } from 'zod'
import { Button } from '_src/components/ui/button'
import CategoryTable from '_src/components/categories/DataTable'
import { Input } from '_src/components/ui/input'
import { Label } from '_src/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '_src/components/ui/dialog'
import { AlertDialog } from '_src/components/ui/alert-dialog'

export const Route = createFileRoute('/_authenticated/admin/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>

        {/* <Button variant={'default'}>Create Category</Button> */}
        <CategoryModal />
      </div>
      <CategoryTable />
    </div>
  )
}

const categorySchema = z.object({
  id: z.coerce.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  parent: z.coerce.number().or(z.object({})).optional().nullable(),
  categoryCode: z.string().min(1),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

const CategoryModal = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Form state for adding new user
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentCategory: '',
    isActive: 'true',
    // image_url: ''
  })

  // Function to handle form submission
  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error('Please enter a category name')
      return
    }

    const newCategoryData = {
      name: newCategory.name,
      parent_category: newCategory.parentCategory,
      is_active: newCategory.isActive === 'true',
      // image_url: newCategory.image_url,
    }

    console.log(newCategoryData) // setTableData([...tableData, newPayment]) // handle by query invalidation and refetching

    // Reset form
    setNewCategory({
      name: '',
      parentCategory: '',
      isActive: 'true',
      // image_url: ''
    })

    setIsSheetOpen(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'default'}>Create Category</Button>
      </DialogTrigger>
      <DialogContent className="to-card bg-linear-to-b from-sky-100 to-40% bg-size-[100%_101%] sm:max-w-sm dark:from-sky-900">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category id</FormLabel>
                    <FormControl>
                      <Input className="p-4 text-sm " disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Code</FormLabel>
                    <FormControl>
                      <Input
                        className="p-4 text-sm "
                        placeholder="Enter Category Code"
                        defaultValue={
                          mode === 'create' ? categoryCodePreview : field.value
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      className="p-4 text-sm "
                      placeholder="Enter Category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      className="p-4 text-sm "
                      placeholder="Enter slug"
                      defaultValue={
                        mode === 'create' ? slugPreview : field.value
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent"
              render={({ field }) => {
                const parentId = field.value
                  ? typeof field.value === 'object' && field.value !== null
                    ? field.value.id
                    : field.value
                  : null

                const selectValue = parentId !== null ? String(parentId) : ''
                return (
                  <FormItem>
                    <FormLabel>Parent Category (Optional)</FormLabel>

                    <Select
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : null)
                      }}
                      value={selectValue}
                    >
                      <FormControl className="p-4 border border-neutral-200">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Parent">
                            {selectValue
                              ? categories.find(
                                  (category) =>
                                    category.id === Number(selectValue),
                                )?.name
                              : 'Select Parent'}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {/* A none parent category */}
                        <SelectItem value="0">None</SelectItem>

                        {categories
                          .filter((category) => !category.parentId)
                          .map((category) => (
                            <SelectItem
                              key={category.id}
                              value={String(category.id)}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-center justify-around gap-4 p-4 border rounded-md">
                      <FormLabel>Active Status</FormLabel>

                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row items-center justify-around gap-4 p-4 border rounded-md">
                      <FormLabel>Is Featured ?</FormLabel>

                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            {mode === 'edit' && (
              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="mr-auto"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the category and remove the data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white bg-emerald-600 hover:bg-emerald-700"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
