import React from 'react';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem/TodoItem';

type Props = {
  todos: Todo[];
  deletingTodoId: number | null;
  updatingTodoId: number | null;
  tempTodo: Todo | null;
  onDelete: (todoId: number) => void;
  onToggle: (todo: Todo) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  deletingTodoId,
  updatingTodoId,
  tempTodo,
  onDelete,
  onToggle,
}) => {
  if (todos.length === 0 && !tempTodo) {
    return null;
  }

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLoading={deletingTodoId === todo.id || updatingTodoId === todo.id}
          onDelete={() => onDelete(todo.id)}
          onToggle={() => onToggle(todo)}
        />
      ))}

      {tempTodo && <TodoItem todo={tempTodo} isLoading onToggle={() => {}} />}
    </section>
  );
};
