import React from 'react';
import classNames from 'classnames';
import { Filter } from '../../types/Filter';

type Props = {
  notCompletedCount: number;
  hasCompletedTodos: boolean;
  selectedFilter: Filter;
  onFilterChange: (event: React.MouseEvent, filter: Filter) => void;
  onClearCompleted: () => void;
};

export const TodoFooter: React.FC<Props> = ({
  notCompletedCount,
  hasCompletedTodos,
  selectedFilter,
  onFilterChange,
  onClearCompleted,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {notCompletedCount} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: selectedFilter === Filter.All,
          })}
          data-cy="FilterLinkAll"
          onClick={event => onFilterChange(event, Filter.All)}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: selectedFilter === Filter.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={event => onFilterChange(event, Filter.Active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: selectedFilter === Filter.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={event => onFilterChange(event, Filter.Completed)}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!hasCompletedTodos}
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
