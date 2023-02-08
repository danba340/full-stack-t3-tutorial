import toast from "react-hot-toast"
import type { Todo } from "../types"
import { api } from "../utils/api"

type TodoProps = {
	todo: Todo
}

export default function Todo({ todo }: TodoProps) {
	const { id, text, done } = todo

	const trpc = api.useContext()

	const { mutate: doneMutation } = api.todo.toggle.useMutation({
		onMutate: async ({ id, done }) => {

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await trpc.todo.all.cancel()

			// Snapshot the previous value
			const previousTodos = trpc.todo.all.getData()

			// Optimistically update to the noe value
			trpc.todo.all.setData(undefined, (prev) => {
				if (!prev) return previousTodos
				return prev.map(t => {
					if (t.id === id) {
						return ({
							...t,
							done
						})
					}
					return t
				})
			})


			return ({ previousTodos })
		},
		onSuccess: (err, { done }) => {
			if (done) {
				toast.success('Todo completed 🎉')
			}
		},

		onError: (err, newTodo, context) => {
			toast.error(`An error occured when setting todo to ${done ? 'done' : 'undone'}`)
			trpc.todo.all.setData(undefined, () => context?.previousTodos)
		},
		onSettled: async () => {
			await trpc.todo.all.invalidate()
		}
	})

	const { mutate: deleteMutation } = api.todo.delete.useMutation({
		onMutate: async (deleteId) => {

			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await trpc.todo.all.cancel()

			// Snapshot the previous value
			const previousTodos = trpc.todo.all.getData()

			// Optimistically update to the noe value
			trpc.todo.all.setData(undefined, (prev) => {
				if (!prev) return previousTodos
				return prev.filter(t => t.id !== deleteId)
			})


			return ({ previousTodos })
		},

		onError: (err, newTodo, context) => {
			toast.error('An error occures when deleting todo')
			trpc.todo.all.setData(undefined, () => context?.previousTodos)
		},
		onSettled: async () => {
			await trpc.todo.all.invalidate()
		}
	})

	return (
		<>
			<div
				className="flex gap-2 items-center justify-between"
			>
				<div className="flex gap-2 items-center">
					<input
						className="cursor-pointer w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
						type="checkbox" name="done" id={id}
						checked={done}
						onChange={(e) => {
							doneMutation({ id, done: e.target.checked })
						}}
					/>
					<label htmlFor={id} className={`cursor-pointer ${done ? 'line-through' : ''}`}>
						{text}
					</label>
				</div>
				<button
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					onClick={() => {
						deleteMutation(id)
					}}
				>Delete</button>
			</div>
		</>
	)
}