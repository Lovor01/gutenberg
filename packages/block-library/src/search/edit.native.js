/**
 * External dependencies
 */
import { View } from 'react-native';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	PlainText,
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { useRef, useEffect, useState } from '@wordpress/element';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './style.scss';

/**
 * Constants
 */
const MIN_BUTTON_WIDTH = 75;

const BUTTON_OPTIONS = [
	{ value: 'button-inside', label: __( 'Button inside' ) },
	{ value: 'button-outside', label: __( 'Button outside' ) },
	{ value: 'no-button', label: __( 'No button' ) },
];

export default function SearchEdit( {
	onFocus,
	isSelected,
	attributes,
	setAttributes,
	className,
} ) {
	const [ isButtonSelected, setIsButtonSelected ] = useState( false );
	const [ isLabelSelected, setIsLabelSelected ] = useState( false );
	const [ isPlaceholderSelected, setIsPlaceholderSelected ] = useState(
		true
	);

	const textInputRef = useRef( null );

	const {
		label,
		showLabel,
		buttonPosition,
		buttonUseIcon,
		placeholder,
		buttonText,
	} = attributes;

	/*
	 * Called when the value of isSelected changes. Blurs the PlainText component
	 * used by the placeholder when this block loses focus.
	 */
	useEffect( () => {
		if ( hasTextInput() && isPlaceholderSelected && ! isSelected ) {
			textInputRef.current.blur();
		}
	}, [ isSelected ] );

	const hasTextInput = () => {
		return textInputRef && textInputRef.current;
	};

	const getBlockClassNames = () => {
		return classnames(
			className,
			'button-inside' === buttonPosition
				? 'wp-block-search__button-inside'
				: undefined,
			'button-outside' === buttonPosition
				? 'wp-block-search__button-outside'
				: undefined,
			'no-button' === buttonPosition
				? 'wp-block-search__no-button'
				: undefined,
			'button-only' === buttonPosition
				? 'wp-block-search__button-only'
				: undefined,
			! buttonUseIcon && 'no-button' !== buttonPosition
				? 'wp-block-search__text-button'
				: undefined,
			buttonUseIcon && 'no-button' !== buttonPosition
				? 'wp-block-search__icon-button'
				: undefined
		);
	};

	const getSelectedButtonPositionLabel = ( option ) => {
		switch ( option ) {
			case 'button-inside':
				return __( 'Inside' );
			case 'button-outside':
				return __( 'Outside' );
			case 'no-button':
				return __( 'No button' );
		}
	};

	const blockProps = useBlockProps( {
		className: getBlockClassNames(),
	} );

	const controls = (
		<InspectorControls>
			<PanelBody title={ __( 'Search settings' ) }>
				<ToggleControl
					label={ __( 'Hide search heading' ) }
					checked={ ! showLabel }
					onChange={ () => {
						setAttributes( {
							showLabel: ! showLabel,
						} );
					} }
				/>
				<SelectControl
					label={ __( 'Button position' ) }
					value={ getSelectedButtonPositionLabel( buttonPosition ) }
					onChange={ ( position ) => {
						setAttributes( {
							buttonPosition: position,
						} );
					} }
					options={ BUTTON_OPTIONS }
					hideCancelButton={ true }
				/>
				{ buttonPosition !== 'no-button' && (
					<ToggleControl
						label={ __( 'Use icon button' ) }
						checked={ buttonUseIcon }
						onChange={ () => {
							setAttributes( {
								buttonUseIcon: ! buttonUseIcon,
							} );
						} }
					/>
				) }
			</PanelBody>
		</InspectorControls>
	);

	const isButtonInside = buttonPosition === 'button-inside';

	const borderStyle = usePreferredColorSchemeStyle(
		styles.border,
		styles.borderDark
	);

	const inputStyle = [
		usePreferredColorSchemeStyle(
			styles.plainTextInput,
			styles.plainTextInputDark
		),
		! isButtonInside && borderStyle,
	];

	const placeholderStyle = usePreferredColorSchemeStyle(
		styles.plainTextPlaceholder,
		styles.plainTextPlaceholderDark
	);

	const searchBarStyle = [
		styles.searchBarContainer,
		isButtonInside && borderStyle,
	];

	const renderTextField = () => {
		return (
			<PlainText
				ref={ textInputRef }
				isSelected={ isPlaceholderSelected }
				className="wp-block-search__input"
				style={ inputStyle }
				numberOfLines={ 1 }
				ellipsizeMode="tail" // currently only works on ios
				label={ null }
				value={ placeholder }
				placeholder={
					placeholder ? undefined : __( 'Optional placeholder…' )
				}
				onChange={ ( newVal ) =>
					setAttributes( { placeholder: newVal } )
				}
				onFocus={ () => {
					setIsPlaceholderSelected( true );
					onFocus();
				} }
				onBlur={ () => setIsPlaceholderSelected( false ) }
				placeholderTextColor={ placeholderStyle.color }
			/>
		);
	};

	// To achieve proper expanding and shrinking `RichText` on Android, there is a need to set
	// a `placeholder` as an empty string when `RichText` is focused,
	// because `AztecView` is calculating a `minWidth` based on placeholder text.
	const buttonPlaceholderText =
		isButtonSelected ||
		( ! isButtonSelected && buttonText && buttonText !== '' )
			? ''
			: __( 'Add button text' );

	const renderButton = () => {
		return (
			<View style={ styles.buttonContainer }>
				{ buttonUseIcon && <Icon icon={ search } { ...styles.icon } /> }

				{ ! buttonUseIcon && (
					<RichText
						className="wp-block-search__button"
						identifier="text"
						tagName="p"
						style={ styles.richTextButton }
						placeholder={ buttonPlaceholderText }
						value={ buttonText }
						withoutInteractiveFormatting
						onChange={ ( html ) =>
							setAttributes( { buttonText: html } )
						}
						minWidth={ MIN_BUTTON_WIDTH }
						textAlign="center"
						isSelected={ isButtonSelected }
						__unstableMobileNoFocusOnMount={ ! isSelected }
						unstableOnFocus={ () => {
							setIsButtonSelected( true );
						} }
						onBlur={ () => {
							setIsButtonSelected( false );
						} }
						selectionColor={ styles.richTextButtonCursor.color }
					/>
				) }
			</View>
		);
	};

	return (
		<View { ...blockProps } style={ styles.searchBlockContainer }>
			{ isSelected && controls }

			{ showLabel && (
				<RichText
					className="wp-block-search__label"
					identifier="text"
					tagName="p"
					style={ styles.richTextLabel }
					aria-label={ __( 'Label text' ) }
					placeholder={ __( 'Add label…' ) }
					withoutInteractiveFormatting
					value={ label }
					onChange={ ( html ) => setAttributes( { label: html } ) }
					isSelected={ isLabelSelected }
					__unstableMobileNoFocusOnMount={ ! isSelected }
					unstableOnFocus={ () => {
						setIsLabelSelected( true );
					} }
					onBlur={ () => {
						setIsLabelSelected( false );
					} }
				/>
			) }

			{ ( 'button-inside' === buttonPosition ||
				'button-outside' === buttonPosition ) && (
				<View style={ searchBarStyle }>
					{ renderTextField() }
					{ renderButton() }
				</View>
			) }

			{ 'button-only' === buttonPosition && renderButton() }
			{ 'no-button' === buttonPosition && renderTextField() }
		</View>
	);
}
