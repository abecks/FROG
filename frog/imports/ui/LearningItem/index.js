// @flow
import * as React from 'react';
import {
  type LIComponentPropsT,
  type LearningItemT,
  uuid,
  Doc
} from 'frog-utils';
import { omit, isEqual } from 'lodash';
import Button from '@material-ui/core/Button';

import ReactiveHOC from '../StudentView/ReactiveHOC';
import LearningItemChooser from './LearningItemChooser';
import { learningItemTypesObj } from '../../activityTypes';
import LearningItemWithSlider from './LearningItemWithSlider';
import RenderLearningItem from './RenderLearningItem';

class LearningItem extends React.Component<
  {
    ...{| dataFn: Doc |},
    ...LIComponentPropsT
  },
  { reload: string }
> {
  state = { reload: '' };

  getEmptyDataStructure = (liType: string): any =>
    learningItemTypesObj[liType].dataStructure;

  shouldComponentUpdate(nextProps: Object, nextState: Object) {
    return (
      nextState.reload !== this.state.reload ||
      !isEqual(omit(nextProps, 'dataFn'), omit(this.props, 'dataFn'))
    );
  }

  render() {
    const props = this.props;
    if (props.type === 'history' && typeof props.id === 'string') {
      return (
        <LearningItemWithSlider
          id={props.id}
          render={props.render}
          dataFn={props.dataFn}
        />
      );
    }
    if (
      props.type === 'view' ||
      props.type === 'thumbView' ||
      props.type === 'edit'
    ) {
      const id = props.id;
      const ToRun =
        typeof id === 'string'
          ? ReactiveHOC(
              id,
              props.dataFn.doc.connection,
              undefined,
              'li',
              this.props.dataFn.meta,
              props.dataFn.backend
            )(RenderLearningItem)
          : newprops => (
              <RenderLearningItem data={id.liDocument} {...newprops} />
            );

      return (
        <ToRun
          key={typeof props.id === 'string' ? props.id : props.id.liDocument.id}
          render={props.render}
          type={props.type}
          id={props.id}
          search={props.search || undefined}
          clickZoomable={props.type === 'thumbView' && props.clickZoomable}
        />
      );
    }
    if (props.type === 'create' || props.type === 'createLIPayload') {
      let onCreate;
      if (props.autoInsert) {
        onCreate = li => {
          const id = uuid();
          props.dataFn.objInsert({ li, id, ...(props.meta || {}) }, id);
          if (typeof props.onCreate === 'function') {
            props.onCreate(li);
          }
          if (props.dataFn.stream) {
            props.dataFn.stream({ li });
          }
          this.setState({ reload: uuid() });
          this.forceUpdate();
        };
      }
      if (!onCreate) {
        onCreate = props.onCreate;
      }
      const dataFn = props.dataFn;

      const createLearningItem = (liType, item, _, immutable) => {
        const id = dataFn.createLearningItem(
          liType,
          item,
          { ...(dataFn.meta || {}), ...(props.meta || {}) },
          immutable
        );
        if (id && onCreate) {
          onCreate(id);
        }
        return id;
      };

      if (props.type === 'createLIPayload' && props.liType) {
        if (learningItemTypesObj[props.liType].createPayload) {
          return learningItemTypesObj[props.liType].createPayload(
            props.payload,
            dataFn,
            createLearningItem
          );
        }
      }

      if (props.liType) {
        const liT: LearningItemT<any> = learningItemTypesObj[props.liType];
        if (liT.Creator) {
          const ToRun = liT.Creator;
          return (
            <ToRun
              createLearningItem={createLearningItem}
              LearningItem={dataFn.LearningItem}
              dataFn={dataFn}
            />
          );
        } else {
          const lid = props.dataFn.createLearningItem(
            liT.id,
            liT.dataStructure,
            {
              draft: true
            }
          );
          if (typeof lid === 'string') {
            return (
              <LearningItem
                key={this.state.reload}
                id={lid}
                type="edit"
                reload={this.state.reload}
                dataFn={props.dataFn}
                render={({ dataFn: childDataFn, children }) => (
                  <div style={{ marginLeft: '10px' }}>
                    {children}
                    <Button
                      variant="raised"
                      color="primary"
                      onClick={() => {
                        childDataFn.objInsert(false, 'draft');
                        childDataFn.objInsert(new Date(), 'createdAt');
                        if (onCreate) {
                          onCreate(lid);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              />
            );
          } else {
            return <h4>Cannot edit static learning item</h4>;
          }
        }
      } else {
        return (
          <LearningItemChooser dataFn={props.dataFn} onCreate={onCreate} />
        );
      }
    }
    return null;
  }
}

export default LearningItem;
