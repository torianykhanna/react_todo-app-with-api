/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';
import { Filter } from './types/Filter';
import { ErrorMessages } from './types/ErrorMessages';
import { getFilteredTodos } from './utils/getFilteredTodos';
import { TodoList } from './components/TodoList/TodoList';
import { TodoFooter } from './components/TodoFooter/TodoFooter';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessages>(
    ErrorMessages.None,
  );
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const newTodoFieldRef = useRef<HTMLInputElement>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<Filter>(Filter.All);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

  const showError = (message: ErrorMessages) => {
    setErrorMessage(message);
  };

  useEffect(() => {
    if (errorMessage === ErrorMessages.None) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setErrorMessage(ErrorMessages.None);
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [errorMessage]);

  useEffect(() => {
    setErrorMessage(ErrorMessages.None);
    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => showError(ErrorMessages.LoadTodos));
  }, []);

  useEffect(() => {
    if (!isLoading && deletingTodoId === null && updatingTodoId === null) {
      newTodoFieldRef.current?.focus();
    }
  }, [isLoading, deletingTodoId, updatingTodoId]);

  function handleFilterChange(event: React.MouseEvent, newFilterState: Filter) {
    event.preventDefault();

    setSelectedFilter(newFilterState);
  }

  function handleAddTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      showError(ErrorMessages.EmptyTitle);

      return;
    }

    setErrorMessage(ErrorMessages.None);
    setIsLoading(true);

    const newTempTodo: Todo = {
      id: 0,
      title: trimmedTitle,
      completed: false,
      userId: todoService.USER_ID,
    };

    setTempTodo(newTempTodo);

    todoService
      .addTodo(trimmedTitle)
      .then(newTodo => {
        setTodos(prev => [...prev, newTodo]);
        setNewTitle('');
        setTempTodo(null);
      })
      .catch(() => {
        showError(ErrorMessages.AddTodo);
        setTempTodo(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleDeleteTodo(todoId: number) {
    setErrorMessage(ErrorMessages.None);
    setDeletingTodoId(todoId);

    todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        showError(ErrorMessages.DeleteTodo);
      })
      .finally(() => {
        setDeletingTodoId(null);
      });
  }

  function handleClearCompleted() {
    setErrorMessage(ErrorMessages.None);

    const completedTodos = todos.filter(todo => todo.completed);

    const requests = completedTodos.map(todo =>
      todoService.deleteTodo(todo.id),
    );

    Promise.allSettled(requests).then(results => {
      const hasError = results.some(reject => reject.status === 'rejected');

      setTodos(prev =>
        prev.filter(
          todo =>
            !completedTodos.some(
              completedTodo =>
                completedTodo.id === todo.id &&
                results[
                  completedTodos.findIndex(
                    completed => completed.id === completedTodo.id,
                  )
                ].status === 'fulfilled',
            ),
        ),
      );

      if (hasError) {
        showError(ErrorMessages.DeleteTodo);
      }

      newTodoFieldRef.current?.focus();
    });
  }

  function handleToggleTodo(todo: Todo) {
    setErrorMessage(ErrorMessages.None);
    setUpdatingTodoId(todo.id);

    todoService
      .updateTodo(todo.id, { completed: !todo.completed })
      .then(updatedTodo => {
        setTodos(prev =>
          prev.map(currentTodo =>
            currentTodo.id === todo.id ? updatedTodo : currentTodo,
          ),
        );
      })
      .catch(() => {
        showError(ErrorMessages.UpdateTodo);
      })
      .finally(() => {
        setUpdatingTodoId(null);
      });
  }

  const filteredTodos = getFilteredTodos(todos, selectedFilter);

  const notCompletedCount = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos],
  );

  const hasCompletedTodos = todos.some(todo => todo.completed);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleAddTodo}>
            <input
              ref={newTodoFieldRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={event => setNewTitle(event.target.value)}
              autoFocus
              disabled={isLoading}
            />
          </form>
        </header>

        <TodoList
          todos={filteredTodos}
          deletingTodoId={deletingTodoId}
          updatingTodoId={updatingTodoId}
          tempTodo={tempTodo}
          onDelete={handleDeleteTodo}
          onToggle={handleToggleTodo}
        />

        {todos.length > 0 && (
          <TodoFooter
            notCompletedCount={notCompletedCount}
            hasCompletedTodos={hasCompletedTodos}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: errorMessage === ErrorMessages.None },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage(ErrorMessages.None)}
        />
        {errorMessage}
        {/* show only one message at a time */}
        {/*
        Unable to update a todo */}
      </div>
    </div>
  );
};
