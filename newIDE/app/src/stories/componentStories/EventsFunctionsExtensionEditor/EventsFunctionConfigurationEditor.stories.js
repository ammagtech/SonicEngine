// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionConfigurationEditor from '../../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor';

export default {
  title: 'EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor',
  component: EventsFunctionConfigurationEditor,
  decorators: [paperDecorator],
};

export const DefaultFreeFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.emptySceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={null}
      objectsContainer={testProject.testLayout.getObjects()}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testEventsFunction}
      eventsBasedBehavior={null}
      eventsBasedObject={null}
      eventsFunctionsContainer={testProject.testEventsFunctionsExtension}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
      onFunctionParameterWillBeRenamed={action(
        'onFunctionParameterWillBeRenamed'
      )}
      onFunctionParameterTypeChanged={action('onFunctionParameterTypeChanged')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultBehaviorFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.emptySceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={null}
      objectsContainer={testProject.testLayout.getObjects()}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testBehaviorEventsFunction}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      eventsBasedObject={null}
      eventsFunctionsContainer={testProject.testEventsBasedBehavior.getEventsFunctions()}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
      onFunctionParameterWillBeRenamed={action(
        'onFunctionParameterWillBeRenamed'
      )}
      onFunctionParameterTypeChanged={action('onFunctionParameterTypeChanged')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultBehaviorLifecycleFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.emptySceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={null}
      objectsContainer={testProject.testLayout.getObjects()}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testBehaviorLifecycleEventsFunction}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      eventsBasedObject={null}
      eventsFunctionsContainer={testProject.testEventsBasedBehavior.getEventsFunctions()}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
      onFunctionParameterWillBeRenamed={action(
        'onFunctionParameterWillBeRenamed'
      )}
      onFunctionParameterTypeChanged={action('onFunctionParameterTypeChanged')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultObjectFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.emptySceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={null}
      objectsContainer={testProject.testLayout.getObjects()}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testObjectEventsFunction}
      eventsBasedBehavior={null}
      eventsBasedObject={testProject.testEventsBasedObject}
      eventsFunctionsContainer={testProject.testEventsBasedObject.getEventsFunctions()}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
      onFunctionParameterWillBeRenamed={action(
        'onFunctionParameterWillBeRenamed'
      )}
      onFunctionParameterTypeChanged={action('onFunctionParameterTypeChanged')}
    />
  </FixedHeightFlexContainer>
);
