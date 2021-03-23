/**
 * External dependencies
 */
import renderer from 'react-test-renderer';
import { TextInput } from 'react-native';

/**
 * WordPress dependencies
 */
import { BlockEdit } from '@wordpress/block-editor';
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { metadata, settings, name } from '../index';

const Code = ( { clientId, ...props } ) => (
	<BlockEdit name={ name } clientId={ clientId || 0 } { ...props } />
);

describe( 'Code', () => {
	beforeAll( () => {
		registerBlockType( name, {
			...metadata,
			...settings,
		} );
	} );

	afterAll( () => {
		unregisterBlockType( name );
	} );

	it( 'renders without crashing', () => {
		const component = renderer.create(
			<Code attributes={ { content: '' } } />
		);
		const rendered = component.toJSON();
		expect( rendered ).toBeTruthy();
	} );

	it( 'renders given text without crashing', () => {
		const component = renderer.create(
			<Code attributes={ { content: 'sample text' } } />
		);
		const testInstance = component.root;
		const textInput = testInstance.findByType( TextInput );
		expect( textInput ).toBeTruthy();
		expect( textInput.props.value ).toBe( 'sample text' );
	} );
} );
