import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TodoList from '../../src/components/TodoList.vue';

function mountTodoList() {
    return shallowMount(TodoList, { global: { stubs: { TodoInput: false, TodoItem: false } } });
}

async function addTodo(wrapper: ReturnType<typeof shallowMount>, text: string) {
    const input = wrapper.getByDataTest('todo-input');
    await input.setValue(text);
    await wrapper.getByDataTest('todo-form').trigger('submit');
}

describe('TodoList', () => {
    it('gebruikt addTodo om een item met de juiste data toe te voegen', async () => {
        // Arrange
        const wrapper = mountTodoList();

        // Act
        await addTodo(wrapper, 'Eerste todo');

        // Assert
        const items = wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' });
        expect(items).toHaveLength(1);
        expect(wrapper.getByDataTest('todo-text').text()).toBe('Eerste todo');

        // Assert input leeg
        const input = wrapper.getByDataTest('todo-input');
        expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('gebruikt toggleTodo om de completed state te wisselen', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Toggle mij');

        // Act
        await wrapper.getByDataTest('todo-checkbox').trigger('change');

        // Assert
        expect(wrapper.getByDataTest('todo-text').classes()).toContain('completed');

        // Act (terugzetten)
        await wrapper.getByDataTest('todo-checkbox').trigger('change');

        // Assert
        expect(wrapper.getByDataTest('todo-text').classes()).not.toContain('completed');
    });

    it('gebruikt deleteTodo om het item te verwijderen', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Verwijder mij');

        // Act
        await wrapper.getByDataTest('delete-button').trigger('click');

        // Assert
        expect(wrapper.getByDataTest('empty-state').exists()).toBe(true);
    });

    it('gebruikt clearCompleted om voltooide items te verwijderen', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Actief');
        await addTodo(wrapper, 'Voltooid');
        await wrapper.findAllComponents({ name: 'TodoItem' })[1].getByDataTest('todo-checkbox').trigger('change');

        // Act
        await wrapper.getByDataTest('clear-completed').trigger('click');

        // Assert
        expect(wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' })).toHaveLength(1);
        expect(wrapper.getByDataTest('todo-text').text()).toBe('Actief');
    });

    it('gebruikt filteredTodos om te filteren op all/active/completed', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'A');
        await addTodo(wrapper, 'B');
        await wrapper.findAllComponents({ name: 'TodoItem' })[0].getByDataTest('todo-checkbox').trigger('change');

        // Act + Assert: all
        await wrapper.getByDataTest('filter-all').trigger('click');
        expect(wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' })).toHaveLength(2);

        // Act + Assert: active
        await wrapper.getByDataTest('filter-active').trigger('click');
        expect(wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' })).toHaveLength(1);

        // Act + Assert: completed
        await wrapper.getByDataTest('filter-completed').trigger('click');
        expect(wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' })).toHaveLength(1);
    });

    it('gebruikt activeCount om niet-voltooide items te tellen', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'A');
        await addTodo(wrapper, 'B');
        await wrapper.findAllComponents({ name: 'TodoItem' })[0].getByDataTest('todo-checkbox').trigger('change');

        // Assert
        expect(wrapper.getByDataTest('active-count').text()).toContain('1');
    });

    it('toont no-results wanneer er geen todos in het geselecteerde filter vallen', async () => {
        // Arrange (geen completed todos)
        const activeWrapper = mountTodoList();
        await addTodo(activeWrapper, 'Alleen actief');

        // Act
        await activeWrapper.getByDataTest('filter-completed').trigger('click');

        // Assert
        expect(activeWrapper.getByDataTest('no-results').exists()).toBe(true);

        // Arrange (geen active todos)
        const completedWrapper = mountTodoList();
        await addTodo(completedWrapper, 'Klaar');
        await completedWrapper.getByDataTest('todo-checkbox').trigger('change');

        // Act
        await completedWrapper.getByDataTest('filter-active').trigger('click');

        // Assert
        expect(completedWrapper.getByDataTest('no-results').exists()).toBe(true);
    });

    it('markeert de actieve filter-knop met class active', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Item');

        // Act
        await wrapper.getByDataTest('filter-active').trigger('click');

        // Assert
        expect(wrapper.getByDataTest('filter-active').classes()).toContain('active');
        expect(wrapper.getByDataTest('filter-all').classes()).not.toContain('active');
        expect(wrapper.getByDataTest('filter-completed').classes()).not.toContain('active');
    });

    it('verbergt clear-completed zonder voltooide todos en toont het na toggle', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Actief');

        // Assert (verborgen)
        expect(wrapper.getByDataTest('clear-completed').exists()).toBe(false);

        // Act
        await addTodo(wrapper, 'Klaar');
        await wrapper.findAllComponents({ name: 'TodoItem' })[1].getByDataTest('todo-checkbox').trigger('change');

        // Assert (zichtbaar)
        expect(wrapper.getByDataTest('clear-completed').exists()).toBe(true);
    });

    it('toont enkelvoud of meervoud in active-count', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Een');

        // Assert
        expect(wrapper.getByDataTest('active-count').text()).toContain('1 taak over');

        // Act
        await addTodo(wrapper, 'Twee');

        // Assert
        expect(wrapper.getByDataTest('active-count').text()).toContain('2 taken over');
    });

    it('verwijdert alleen het aangeklikte item bij delete', async () => {
        // Arrange
        const wrapper = mountTodoList();
        await addTodo(wrapper, 'Blijft');
        await addTodo(wrapper, 'Weg');

        // Act
        const deleteButtons = wrapper.findAllComponents({ name: 'TodoItem' }).map((c) => c.getByDataTest('delete-button'));
        await deleteButtons[1].trigger('click');

        // Assert
        expect(wrapper.getByDataTest('todo-list').findAllComponents({ name: 'TodoItem' })).toHaveLength(1);
        expect(wrapper.getByDataTest('todo-text').text()).toBe('Blijft');
    });

    it('handelt toggleTodo af voor een onbekend id zonder fout', () => {
        // Arrange
        const wrapper = mountTodoList();

        // Act
        (wrapper.vm as any).toggleTodo(999);

        // Assert
        expect(wrapper.getByDataTest('empty-state').exists()).toBe(true);
    });

});