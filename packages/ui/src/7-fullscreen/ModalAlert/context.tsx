import * as React from 'react';
import {useT} from 'use-t';
import {ModalAlert, type ModalAlertProps} from './ModalAlert';

export interface AlertOptions
  extends Pick<ModalAlertProps, 'button' | 'onOk' | 'title' | 'raise' | 'contrast' | 'color'> {
  showCloseButton?: boolean;
}

export type Alert = (msg: React.ReactNode, options?: AlertOptions) => void;

export const context = React.createContext<{alert: Alert}>({alert: () => {}});

let counter = 0;

export const AlertProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [alerts, setAlerts] = React.useState<Array<{id: number; element: React.ReactNode}>>([]);
  const value = React.useMemo(() => {
    const alert: Alert = (msg, {showCloseButton, ...props} = {}) => {
      const id = counter++;
      const onClose = () => {
        setAlerts((alerts) => alerts.filter((item) => item.id !== id));
      };
      const element = (
        <ModalAlert
          {...props}
          key={id}
          onOk={(event) => {
            onClose();
            if (props.onOk) props.onOk(event);
          }}
          onEsc={onClose}
          onOutsideClick={onClose}
          onCloseClick={showCloseButton ? onClose : undefined}
        >
          {msg}
        </ModalAlert>
      );
      setAlerts((alerts) => [...alerts, {id, element}]);
    };
    return {alert};
  }, []);

  return (
    <context.Provider value={value}>
      {children}
      {alerts.map(({element}) => element)}
    </context.Provider>
  );
};

export const useAlert = () => React.useContext(context).alert;

export const useDeleteAlert = () => {
  const [t] = useT();
  const alert = useAlert();

  return (msg: React.ReactNode, options: AlertOptions = {}) => {
    alert(msg, {
      title: options.title ?? t('Delete'),
      button: options.button ?? t('DELETE FOREVER'),
      color: 'rgba(222, 44, 33, .8)',
      raise: true,
      showCloseButton: true,
      ...options,
    });
  };
};

export const UseAlert: React.FC<{children: (alert: Alert) => React.ReactElement}> = ({children}) =>
  children(useAlert());
