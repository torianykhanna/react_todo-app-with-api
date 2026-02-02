import React from 'react';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem/TodoItem';

type Props = {
  todos: Todo[];
  deletingTodoId: number | null;
  tempTodo: Todo | null;
  onDelete: (todoId: number) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  deletingTodoId,
  tempTodo,
  onDelete,
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
          isLoading={deletingTodoId === todo.id}
          onDelete={() => onDelete(todo.id)}
        />
      ))}

      {tempTodo && <TodoItem todo={tempTodo} isLoading />}
    </section>
  );
};
