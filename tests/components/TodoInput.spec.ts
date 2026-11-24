import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import TodoInput from '../../src/components/TodoInput.vue';

describe('TodoInput', () => {
    it('renders form, input and button', () => {
        // Arrange
        const wrapper = shallowMount(TodoInput);

        // Assert
        expect(wrapper.getByDataTest('todo-form').exists()).toBe(true);
        expect(wrapper.getByDataTest('todo-input').exists()).toBe(true);
        expect(wrapper.getByDataTest('add-button').exists()).toBe(true);
        expect(wrapper.getByDataTest('add-button').text()).toBe('Toevoegen');
        expect(wrapper.getByDataTest('todo-input').attributes('placeholder')).toBe(
            'Wat moet er gedaan worden?'
        );
    });

    it('toggles button disabled state based on input', async () => {
        // Arrange
        const wrapper = shallowMount(TodoInput);
        const input = wrapper.getByDataTest('todo-input');
        const button = wrapper.getByDataTest('add-button');

        // Assert (empty)
        expect(button.attributes('disabled')).toBeDefined();

        // Act (whitespace)
        await input.setValue('   ');

        // Assert
        expect(button.attributes('disabled')).toBeDefined();

        // Act (text)
        await input.setValue('Nieuwe todo');

        // Assert
        expect(button.attributes('disabled')).toBeUndefined();
    });

    it('emits add-todo with trimmed text on submit', async () => {
        // Arrange
        const wrapper = shallowMount(TodoInput);
        const input = wrapper.getByDataTest('todo-input');

        // Act
        await input.setValue('  Nieuwe todo  ');
        await wrapper.getByDataTest('todo-form').trigger('submit');

        // Assert
        const emitted = wrapper.emitted('add-todo');
        expect(emitted).toBeTruthy();
        expect(emitted).toHaveLength(1);
        expect(emitted![0]).toEqual(['Nieuwe todo']);
    });

    it('clears input after submit', async () => {
        // Arrange
        const wrapper = shallowMount(TodoInput);
        const input = wrapper.getByDataTest<HTMLInputElement>('todo-input');

        // Act
        await input.setValue('Nieuwe todo');
        await wrapper.getByDataTest('todo-form').trigger('submit');

        // Assert
        expect(input.element.value).toBe('');
    });

    it('does not emit add-todo when input is empty or whitespace', async () => {
        // Arrange
        const wrapper = shallowMount(TodoInput);

        // Act (empty)
        await wrapper.getByDataTest('todo-form').trigger('submit');
        await nextTick();

        // Assert
        expect(wrapper.emitted('add-todo')).toBeUndefined();

        // Act (whitespace)
        const input = wrapper.getByDataTest('todo-input');
        await input.setValue('   ');
        await wrapper.getByDataTest('todo-form').trigger('submit');
        await nextTick();

        // Assert
        expect(wrapper.emitted('add-todo')).toBeUndefined();
    });
});