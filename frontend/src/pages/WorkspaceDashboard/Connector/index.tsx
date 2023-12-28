import { useEffect, useState } from 'react';
import { CheckCircle, Circle, XCircle } from 'react-feather';
import PreLoader from '../../../components/Preloader';
import Organization from '../../../models/organization';
import { APP_NAME, SUPPORTED_VECTOR_DBS } from '../../../utils/constants';
import ChromaLogo from '../../../images/vectordbs/chroma.png';
import PineconeLogo from '../../../images/vectordbs/pinecone.png';
import qDrantLogo from '../../../images/vectordbs/qdrant.png';
import WeaviateLogo from '../../../images/vectordbs/weaviate.png';
import paths from '../../../utils/paths';
import { titleCase } from 'title-case';
import { SyncConnectorModal } from '../../../components/Modals/SyncConnectorModal';

export default function ConnectorCard({
  knownConnector,
  organization,
  workspaces,
}: {
  knownConnector?: any;
  organization?: any;
  workspaces?: any[];
}) {
  const [loading, setLoading] = useState(true);
  const [connector, setConnector] = useState<object | null>(null);
  const [canSync, setCanSync] = useState(false);

  useEffect(() => {
    async function fetchConnector() {
      if (!!knownConnector) {
        if (SUPPORTED_VECTOR_DBS.includes(knownConnector.type)) {
          const { value: result } = await Organization.stats(
            organization.slug,
            'vectorCounts'
          );

          if (!!result) {
            if (
              result.remoteCount > 0 &&
              result.remoteCount !== result.localCount
            )
              setCanSync(true);
          }
        }

        setLoading(false);
        setConnector(knownConnector);
        return;
      }

      setLoading(false);
    }
    fetchConnector();
  }, []);

  async function handleNewConnector(connector: object) {
    if (!connector) return;
    setLoading(true);

    if (SUPPORTED_VECTOR_DBS.includes(connector.type)) {
      const { value: result } = await Organization.stats(
        organization.slug,
        'vectorCounts'
      );

      if (!!result) {
        if (result.remoteCount > 0 && result.remoteCount !== result.localCount)
          setCanSync(true);
      }
    }

    setConnector(connector);
    setLoading(false);
  }

  return (
    <>
      <SyncConnectorModal organization={organization} connector={connector} />
    </>
  );
}

const NewConnectorModal = ({
  organization,
  onNew,
}: {
  organization: any;
  onNew: (newConnector: any) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('chroma');
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | boolean>(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = { type };
    const form = new FormData(e.target);
    for (var [_k, value] of form.entries()) {
      if (_k.includes('::')) {
        const [_key, __key] = _k.split('::');
        if (!data.hasOwnProperty(_key)) data[_key] = {};
        data[_key][__key] = value;
      } else {
        data[_k] = value;
      }
    }

    const { connector, error } = await Organization.addConnector(
      organization.slug,
      data
    );

    if (!connector) {
      setLoading(false);
      setError(error);
      return false;
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onNew(connector);
      setSuccess(false);
    }, 1500);
  };

  return (
    <dialog
      id="new-connector-modal"
      className="w-1/2 rounded-lg"
      onClick={(event) =>
        event.target == event.currentTarget && event.currentTarget?.close()
      }
    >
      <div className="rounded-sm bg-white p-[20px]">
        <div className="px-6.5 py-4">
          <h3 className="font-medium text-black dark:text-white">
            Connect to Vector Database
          </h3>
          <p className="text-sm text-gray-500">
            {APP_NAME} is a tool to help you manage vectors in a vector
            database, but without access to a valid vector database you will be
            limited to read-only actions and limited functionality - you should
            connect to a vector database provider to unlock full functionality.
          </p>
        </div>

        <div hidden={!loading} className="px-6.5">
          <div className="mb-4.5 flex w-full justify-center">
            <PreLoader />
          </div>
        </div>

        <form hidden={loading} onSubmit={handleSubmit}>
          <ul className="mx-6 flex w-full flex-wrap gap-6">
            <li onClick={() => setType('chroma')} className="w-[250px]">
              <input
                name="type"
                type="checkbox"
                value="chroma"
                className="peer hidden"
                checked={type === 'chroma'}
                readOnly={true}
                formNoValidate={true}
              />
              <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                <div className="block">
                  <img
                    src={ChromaLogo}
                    className="mb-2 h-10 w-10 rounded-full"
                  />
                  <div className="w-full text-lg font-semibold">Chroma</div>
                  <div className="flex w-full flex-col gap-y-1 text-sm">
                    <p className="text-xs text-slate-400">trychroma.com</p>
                    Open source vector database you can host yourself.
                  </div>
                </div>
              </label>
            </li>
            <li onClick={() => setType('pinecone')} className="w-[250px]">
              <input
                name="type"
                type="checkbox"
                value="pinecone"
                className="peer hidden"
                checked={type === 'pinecone'}
                readOnly={true}
                formNoValidate={true}
              />
              <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                <div className="block">
                  <img
                    src={PineconeLogo}
                    className="mb-2 h-10 w-10 rounded-full"
                  />
                  <div className="w-full text-lg font-semibold">Pinecone</div>
                  <div className="flex w-full flex-col gap-y-1 text-sm">
                    <p className="text-xs text-slate-400">pinecone.io</p>
                    Cloud-hosted vector database.
                  </div>
                </div>
              </label>
            </li>
            <li onClick={() => setType('qdrant')} className="w-[250px]">
              <input
                name="type"
                type="checkbox"
                value="qdrant"
                className="peer hidden"
                checked={type === 'qdrant'}
                readOnly={true}
                formNoValidate={true}
              />
              <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                <div className="block">
                  <img
                    src={qDrantLogo}
                    className="mb-2 h-10 w-10 rounded-full"
                  />
                  <div className="w-full text-lg font-semibold">qDrant</div>
                  <div className="flex w-full flex-col gap-y-1 text-sm">
                    <p className="text-xs text-slate-400">qdrant.tech</p>
                    Open-source & hosted vector database.
                  </div>
                </div>
              </label>
            </li>
            <li onClick={() => setType('weaviate')} className="w-[250px]">
              <input
                name="type"
                type="checkbox"
                value="weaviate"
                className="peer hidden"
                checked={type === 'weaviate'}
                readOnly={true}
                formNoValidate={true}
              />
              <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                <div className="block">
                  <img
                    src={WeaviateLogo}
                    className="mb-2 h-10 w-10 rounded-full"
                  />
                  <div className="w-full text-lg font-semibold">Weaviate</div>
                  <div className="flex w-full flex-col gap-y-1 text-sm">
                    <p className="text-xs text-slate-400">weaviate.io</p>
                    Open-source & hosted vector database.
                  </div>
                </div>
              </label>
            </li>
          </ul>

          {type === 'chroma' && (
            <div className="mx-6 my-4 flex flex-col gap-y-6">
              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::instanceURL"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Instance URL
                  </label>
                  <p className="text-xs text-gray-500">
                    This is the URL your chroma instance is reachable at.
                  </p>
                </div>
                <input
                  name="settings::instanceURL"
                  autoComplete="off"
                  type="url"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="https://my-domain.com:8000"
                  required={true}
                />
              </div>
              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::authToken"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    API Header & Key
                  </label>
                  <p className="text-xs text-gray-500">
                    If your hosted Chroma instance is protected by an API key -
                    enter the header and api key here.
                  </p>
                </div>
                <div className="flex w-full items-center gap-x-4">
                  <input
                    name="settings::authTokenHeader"
                    autoComplete="off"
                    type="text"
                    className="block w-[20%] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="X-Api-Key"
                  />
                  <input
                    name="settings::authToken"
                    autoComplete="off"
                    type="password"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="sk-myApiKeyToAccessMyChromaInstance"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'pinecone' && (
            <div className="mx-6 my-4 flex flex-col gap-y-6">
              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::environment"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Pinecone Environment
                  </label>
                  <p className="text-xs text-gray-500">
                    You can find this on your Pinecone index.
                  </p>
                </div>
                <input
                  name="settings::environment"
                  autoComplete="off"
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="us-west4-gcp-free"
                  required={true}
                />
              </div>

              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::index"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Pinecone Index
                  </label>
                  <p className="text-xs text-gray-500">
                    You can find this on your Pinecone index.
                  </p>
                </div>
                <input
                  name="settings::index"
                  autoComplete="off"
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="my-index"
                  required={true}
                />
              </div>

              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::apiKey"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    API Key
                  </label>
                  <p className="text-xs text-gray-500">
                    If your hosted Chroma instance is protected by an API key -
                    enter it here.
                  </p>
                </div>
                <input
                  name="settings::apiKey"
                  autoComplete="off"
                  type="password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="ee1051-xxxx-xxxx-xxxx"
                />
              </div>
            </div>
          )}

          {type === 'qdrant' && (
            <div className="mx-6 my-4 flex flex-col gap-y-6">
              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::clusterUrl"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    qDrant Cluster URL
                  </label>
                  <p className="text-xs text-gray-500">
                    You can find this in your cloud hosted qDrant cluster or
                    just using the URL to your local docker container.
                  </p>
                </div>
                <input
                  name="settings::clusterUrl"
                  autoComplete="off"
                  type="url"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="https://6b3a2d01-3b3f-4339-84e9-ead94f28a844.us-east-1-0.aws.cloud.qdrant.io"
                  required={true}
                />
              </div>

              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::apiKey"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    API Key
                  </label>
                  <p className="text-xs text-gray-500">
                    (optional) If you are using qDrant cloud you will need an
                    API key.
                  </p>
                </div>
                <input
                  name="settings::apiKey"
                  autoComplete="off"
                  type="password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="ee1051-xxxx-xxxx-xxxx"
                />
              </div>
            </div>
          )}

          {type === 'weaviate' && (
            <div className="mx-6 my-4 flex flex-col gap-y-6">
              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::clusterUrl"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Weaviate Cluster URL
                  </label>
                  <p className="text-xs text-gray-500">
                    You can find this in your cloud hosted Weaviate cluster or
                    just using the URL to your local docker container.
                  </p>
                </div>
                <input
                  name="settings::clusterUrl"
                  autoComplete="off"
                  type="url"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="https://my-sandbox-b5vipdmw.weaviate.network"
                  required={true}
                />
              </div>

              <div className="">
                <div className="mb-2 flex flex-col gap-y-1">
                  <label
                    htmlFor="settings::apiKey"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    API Key
                  </label>
                  <p className="text-xs text-gray-500">
                    (optional) If you are using Weaviate cloud may need an API
                    key.
                  </p>
                </div>
                <input
                  name="settings::apiKey"
                  autoComplete="off"
                  type="password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="ee1051-xxxx-xxxx-xxxx"
                />
              </div>
            </div>
          )}

          <div className="w-full px-6">
            {error && (
              <p className="my-2 w-full rounded-lg border-red-800 bg-red-50 px-4 py-2 text-red-800">
                {error}
              </p>
            )}
            {success && (
              <p className="my-2 w-full rounded-lg border-green-800 bg-green-50 px-4 py-2 text-green-800">
                Connector added to organization
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg border border-blue-600 py-2 text-center text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Connect to Vector Database
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

const UpdateConnectorModal = ({
  organization,
  connector,
  onUpdate,
}: {
  organization: any;
  connector: any;
  onUpdate: (newConnector: any) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(connector?.type);
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | boolean>(false);
  const settings = JSON.parse(connector?.settings);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = { type };
    const form = new FormData(e.target);
    for (var [_k, value] of form.entries()) {
      if (_k.includes('::')) {
        const [_key, __key] = _k.split('::');
        if (!data.hasOwnProperty(_key)) data[_key] = {};
        data[_key][__key] = value;
      } else {
        data[_k] = value;
      }
    }

    const { connector, error } = await Organization.updateConnector(
      organization.slug,
      data
    );
    if (!connector) {
      setLoading(false);
      setError(error);
      return false;
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      onUpdate(connector);
      setSuccess(false);
    }, 1500);
  };

  return (
    <dialog
      id="edit-connector-modal"
      className="w-1/2 rounded-lg"
      onClick={(event) =>
        event.target == event.currentTarget && event.currentTarget?.close()
      }
    >
      <div className="rounded-sm bg-white p-[20px]">
        <div className="px-6.5 py-4">
          <h3 className="font-medium text-black dark:text-white">
            Update Vector Database Connection
          </h3>
          <p className="text-sm text-gray-500">
            {APP_NAME} is currently connected to a {connector?.type} vector
            database instance. You can update your configuration settings here
            if they have changed.
          </p>
        </div>
        {loading ? (
          <div className="px-6.5">
            <div className="mb-4.5 flex w-full justify-center">
              <PreLoader />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ul className="mx-6 flex w-full flex-wrap gap-6">
              <li onClick={() => setType('chroma')} className="w-[250px]">
                <input
                  name="type"
                  type="checkbox"
                  value="chroma"
                  className="peer hidden"
                  checked={type === 'chroma'}
                  formNoValidate={true}
                />
                <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                  <div className="block">
                    <img
                      src={ChromaLogo}
                      className="mb-2 h-10 w-10 rounded-full"
                    />
                    <div className="w-full text-lg font-semibold">Chroma</div>
                    <div className="flex w-full flex-col gap-y-1 text-sm">
                      <p className="text-xs text-slate-400">trychroma.com</p>
                      Open source vector database you can host yourself.
                    </div>
                  </div>
                </label>
              </li>
              <li onClick={() => setType('pinecone')} className="w-[250px]">
                <input
                  name="type"
                  type="checkbox"
                  value="pinecone"
                  className="peer hidden"
                  checked={type === 'pinecone'}
                  formNoValidate={true}
                />
                <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                  <div className="block">
                    <img
                      src={PineconeLogo}
                      className="mb-2 h-10 w-10 rounded-full"
                    />
                    <div className="w-full text-lg font-semibold">Pinecone</div>
                    <div className="flex w-full flex-col gap-y-1 text-sm">
                      <p className="text-xs text-slate-400">pinecone.io</p>
                      Cloud-hosted vector database.
                    </div>
                  </div>
                </label>
              </li>
              <li onClick={() => setType('qdrant')} className="w-[250px]">
                <input
                  name="type"
                  type="checkbox"
                  value="qdrant"
                  className="peer hidden"
                  checked={type === 'qdrant'}
                  formNoValidate={true}
                />
                <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                  <div className="block">
                    <img
                      src={qDrantLogo}
                      className="mb-2 h-10 w-10 rounded-full"
                    />
                    <div className="w-full text-lg font-semibold">qDrant</div>
                    <div className="flex w-full flex-col gap-y-1 text-sm">
                      <p className="text-xs text-slate-400">qdrant.tech</p>
                      Open-source & hosted vector database.
                    </div>
                  </div>
                </label>
              </li>
              <li onClick={() => setType('weaviate')} className="w-[250px]">
                <input
                  name="type"
                  type="checkbox"
                  value="weaviate"
                  className="peer hidden"
                  checked={type === 'weaviate'}
                  formNoValidate={true}
                />
                <label className="inline-flex h-full w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-50 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-gray-300">
                  <div className="block">
                    <img
                      src={WeaviateLogo}
                      className="mb-2 h-10 w-10 rounded-full"
                    />
                    <div className="w-full text-lg font-semibold">Weaviate</div>
                    <div className="flex w-full flex-col gap-y-1 text-sm">
                      <p className="text-xs text-slate-400">weaviate.io</p>
                      Open-source & hosted vector database.
                    </div>
                  </div>
                </label>
              </li>
            </ul>

            {type === 'chroma' && (
              <div className="mx-6 my-4 flex flex-col gap-y-6">
                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::instanceURL"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Instance URL
                    </label>
                    <p className="text-xs text-gray-500">
                      This is the URL your chroma instance is reachable at.
                    </p>
                  </div>
                  <input
                    name="settings::instanceURL"
                    autoComplete="off"
                    type="url"
                    defaultValue={settings.instanceURL}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="https://my-domain.com:8000"
                    required={true}
                  />
                </div>
                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::authToken"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      API Header & Key
                    </label>
                    <p className="text-xs text-gray-500">
                      If your hosted Chroma instance is protected by an API key
                      - enter the header and api key here.
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-x-4">
                    <input
                      name="settings::authTokenHeader"
                      autoComplete="off"
                      type="text"
                      defaultValue={settings.authTokenHeader}
                      className="block w-[20%] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      placeholder="X-Api-Key"
                    />
                    <input
                      name="settings::authToken"
                      autoComplete="off"
                      type="password"
                      defaultValue={settings.authToken}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      placeholder="sk-myApiKeyToAccessMyChromaInstance"
                    />
                  </div>
                </div>
              </div>
            )}

            {type === 'pinecone' && (
              <div className="mx-6 my-4 flex flex-col gap-y-6">
                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::environment"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Pinecone Environment
                    </label>
                    <p className="text-xs text-gray-500">
                      You can find this on your Pinecone index.
                    </p>
                  </div>
                  <input
                    name="settings::environment"
                    autoComplete="off"
                    type="text"
                    defaultValue={settings.environment}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="us-west4-gcp-free"
                    required={true}
                  />
                </div>

                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::index"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Pinecone Index
                    </label>
                    <p className="text-xs text-gray-500">
                      You can find this on your Pinecone index.
                    </p>
                  </div>
                  <input
                    name="settings::index"
                    autoComplete="off"
                    type="text"
                    defaultValue={settings.index}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="my-index"
                    required={true}
                  />
                </div>

                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::apiKey"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      API Key
                    </label>
                    <p className="text-xs text-gray-500">
                      If your hosted Chroma instance is protected by an API key
                      - enter it here.
                    </p>
                  </div>
                  <input
                    name="settings::apiKey"
                    autoComplete="off"
                    type="password"
                    defaultValue={settings.apiKey}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="ee1051-xxxx-xxxx-xxxx"
                  />
                </div>
              </div>
            )}

            {type === 'qdrant' && (
              <div className="mx-6 my-4 flex flex-col gap-y-6">
                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::clusterUrl"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      qDrant Cluster URL
                    </label>
                    <p className="text-xs text-gray-500">
                      You can find this in your cloud hosted qDrant cluster or
                      just using the URL to your local docker container.
                    </p>
                  </div>
                  <input
                    name="settings::clusterUrl"
                    autoComplete="off"
                    type="url"
                    defaultValue={settings.clusterUrl}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="https://6b3a2d01-3b3f-4339-84e9-ead94f28a844.us-east-1-0.aws.cloud.qdrant.io"
                    required={true}
                  />
                </div>

                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::apiKey"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      API Key
                    </label>
                    <p className="text-xs text-gray-500">
                      (optional) If you are using qDrant cloud you will need an
                      API key.
                    </p>
                  </div>
                  <input
                    name="settings::apiKey"
                    autoComplete="off"
                    type="password"
                    defaultValue={settings.apiKey}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="ee1051-xxxx-xxxx-xxxx"
                  />
                </div>
              </div>
            )}

            {type === 'weaviate' && (
              <div className="mx-6 my-4 flex flex-col gap-y-6">
                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::clusterUrl"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Weaviate Cluster URL
                    </label>
                    <p className="text-xs text-gray-500">
                      You can find this in your cloud hosted Weaviate cluster or
                      just using the URL to your local docker container.
                    </p>
                  </div>
                  <input
                    name="settings::clusterUrl"
                    autoComplete="off"
                    type="url"
                    defaultValue={settings.clusterUrl}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="https://my-sandbox-b5vipdmw.weaviate.network"
                    required={true}
                  />
                </div>

                <div className="">
                  <div className="mb-2 flex flex-col gap-y-1">
                    <label
                      htmlFor="settings::apiKey"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      API Key
                    </label>
                    <p className="text-xs text-gray-500">
                      (optional) If you are using Weaviate cloud you will need
                      an API key.
                    </p>
                  </div>
                  <input
                    name="settings::apiKey"
                    autoComplete="off"
                    type="password"
                    defaultValue={settings.apiKey}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="ee1051-xxxx-xxxx-xxxx"
                  />
                </div>
              </div>
            )}

            <div className="w-full px-6">
              {error && (
                <p className="my-2 w-full rounded-lg border-red-800 bg-red-50 px-4 py-2 text-red-800">
                  {error}
                </p>
              )}
              {success && (
                <p className="my-2 w-full rounded-lg border-green-800 bg-green-50 px-4 py-2 text-green-800">
                  Connector changes saved
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg border border-blue-600 py-2 text-center text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Connect to Vector Database
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
};
