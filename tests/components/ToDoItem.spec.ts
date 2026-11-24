import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TodoItem from '../../src/components/TodoItem.vue';

type Todo = {
    id: number;
    text: string;
    completed: boolean;
};

describe('TodoItem', () => {
    it('renders the todo text', () => {
        // Arrange
        const todo: Todo = { id: 1, text: 'Eerste todo', completed: false };
        const wrapper = shallowMount(TodoItem, { props: { todo } });

        // Assert
        expect(wrapper.getByDataTest('todo-text').text()).toBe('Eerste todo');
    });

    it('applies completed class based on completed prop', () => {
        // Arrange
        const completedTodo: Todo = { id: 1, text: 'Klaar', completed: true };
        const activeTodo: Todo = { id: 2, text: 'Nog niet', completed: false };

        // Act
        const completedWrapper = shallowMount(TodoItem, { props: { todo: completedTodo } });
        const activeWrapper = shallowMount(TodoItem, { props: { todo: activeTodo } });

        // Assert
        expect(completedWrapper.getByDataTest('todo-text').classes()).toContain('completed');
        expect(activeWrapper.getByDataTest('todo-text').classes()).not.toContain('completed');
    });

    it('reflects completed state in checkbox', () => {
        // Arrange
        const completedTodo: Todo = { id: 1, text: 'Klaar', completed: true };
        const activeTodo: Todo = { id: 2, text: 'Actief', completed: false };

        // Act
        const completedWrapper = shallowMount(TodoItem, { props: { todo: completedTodo } });
        const activeWrapper = shallowMount(TodoItem, { props: { todo: activeTodo } });

        // Assert
        expect((completedWrapper.getByDataTest('todo-checkbox').element as HTMLInputElement).checked).toBe(true);
        expect((activeWrapper.getByDataTest('todo-checkbox').element as HTMLInputElement).checked).toBe(false);
    });

    it('emits toggle with todo id when checkbox changes', async () => {
        // Arrange
        const todo: Todo = { id: 42, text: 'Toggle mij', completed: false };
        const wrapper = shallowMount(TodoItem, { props: { todo } });

        // Act
        await wrapper.getByDataTest('todo-checkbox').trigger('change');

        // Assert
        const emitted = wrapper.emitted('toggle');
        expect(emitted).toBeTruthy();
        expect(emitted).toHaveLength(1);
        expect(emitted![0]).toEqual([42]);
    });

    it('emits delete with todo id when delete button is clicked', async () => {
        // Arrange
        const todo: Todo = { id: 7, text: 'Verwijder mij', completed: false };
        const wrapper = shallowMount(TodoItem, { props: { todo } });

        // Act
        await wrapper.getByDataTest('delete-button').trigger('click');

        // Assert
        const emitted = wrapper.emitted('delete');
        expect(emitted).toBeTruthy();
        expect(emitted).toHaveLength(1);
        expect(emitted![0]).toEqual([7]);
    });

    it('renders required data-test elements', () => {
        // Arrange
        const todo: Todo = { id: 1, text: 'Structuur', completed: false };
        const wrapper = shallowMount(TodoItem, { props: { todo } });

        // Assert
        expect(wrapper.getByDataTest('todo-item').exists()).toBe(true);
        expect(wrapper.getByDataTest('todo-checkbox').exists()).toBe(true);
        expect(wrapper.getByDataTest('todo-text').exists()).toBe(true);
        expect(wrapper.getByDataTest('delete-button').exists()).toBe(true);
    });
});