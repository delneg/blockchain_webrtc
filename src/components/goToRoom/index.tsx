import { FunctionalComponent, h } from 'preact';
import style from './style.css';
import { useState } from 'preact/hooks';
import shortId from 'shortid'
import {Link} from "preact-router/match";
const GoToRoomComponent: FunctionalComponent = () => {
    const [roomId, setRoomId] = useState(shortId.generate());
    return (
        <div className={style["enter-room-container"]}>
            <form>
                <input type="text" value={roomId} placeholder="Room id" onInput={(e ): void => {
                    const target = e.target as HTMLInputElement;
                    setRoomId(target.value);
                }} />
                <Link href={`/${roomId}`}>
                    Enter
                </Link>
            </form>
        </div>
    );
};

export default GoToRoomComponent;