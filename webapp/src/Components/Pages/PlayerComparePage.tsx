import {Divider, Grid} from "@material-ui/core"
import * as _ from "lodash"
import * as qs from "qs"
import * as React from "react"
import {RouteComponentProps} from "react-router-dom"
import {PlayStyleResponse} from "../../Models/Player/PlayStyle"
import {getPlayer, getPlayerFromName, getPlayerPlayStyles} from "../../Requests/Player"
import {AddPlayerInput} from "../Player/Compare/AddPlayerInput"
import {PlayerChip} from "../Player/Compare/PlayerChip"
import {PlayerCompareCharts} from "../Player/Compare/PlayerCompareCharts"
import {BasePage} from "./BasePage"

interface PlayerCompareQueryParams {
    ids: string[]
}

type Props = RouteComponentProps<{}>

interface State {
    ids: string[]
    players: Player[]
    playerPlayStyles: PlayStyleResponse[]
    inputId: string
}

export class PlayerComparePage extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {ids: [], players: [], playerPlayStyles: [], inputId: ""}
    }

    public componentDidMount() {
        this.readQueryParams()
    }

    public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (prevState.ids !== this.state.ids) {
            // Set params if updated through input
            this.setQueryParams()

            // Get player data on first load
            if (this.state.playerPlayStyles.length === 0) {
                this.getPlayersData()
            }
        }
    }

    public render() {
        const {ids, players, playerPlayStyles} = this.state
        const playerChips = players.map((player) => (
            <PlayerChip {...player} onDelete={() => this.handleRemovePlayer(player.id)} key={player.id}/>
        ))
        return (
            <BasePage>
                <Grid container spacing={24} justify="center">
                    <Grid item xs={12} container justify="center">
                        <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
                            <AddPlayerInput onSubmit={this.attemptToAddPlayer}
                                            value={this.state.inputId}
                                            onChange={this.handleInputChange}/>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={11} md={10} lg={9} xl={8} container spacing={8}>
                        {playerChips.map((playerChip) => (
                            <Grid item key={playerChip.key as string}>
                                {playerChip}
                            </Grid>
                        ))}
                    </Grid>
                    <Grid item xs={12}> <Divider/> </Grid>
                    <Grid item xs={12} container spacing={32}>
                        {playerPlayStyles.length > 0 &&
                        playerPlayStyles.length === players.length &&
                        <PlayerCompareCharts ids={ids}
                                             players={players}
                                             playerPlayStyles={playerPlayStyles}/>
                        }
                    </Grid>
                </Grid>
            </BasePage>
        )
    }

    private readonly readQueryParams = () => {
        const queryString = this.props.location.search
        if (queryString !== "") {
            const queryParams: PlayerCompareQueryParams = qs.parse(
                this.props.location.search,
                {ignoreQueryPrefix: true}
            )
            if (queryParams.ids) {
                this.setState({ids: _.uniq(queryParams.ids)})
            }
        }
    }

    // TODO: Compartmentalise query params, data retrieval
    private readonly setQueryParams = () => {
        const queryString = qs.stringify(
            {ids: this.state.ids},
            {addQueryPrefix: true, indices: false}
        )
        this.props.history.replace({search: queryString})
    }

    private readonly getPlayersData = (): void => {
        Promise.all([this.getPlayers(), this.getPlayerPlayStyles()])
    }

    private readonly getPlayers = (): Promise<void> => {
        return Promise.all(this.state.ids.map((id) => getPlayer(id)))
            .then((players) => this.setState({players}))
    }

    private readonly getPlayerPlayStyles = (): Promise<void> => {
        return Promise.all(this.state.ids.map((id) => getPlayerPlayStyles(id)))
            .then((playerPlayStyles) => this.setState({playerPlayStyles}))
    }

    private readonly handleRemovePlayer = (id: string) => {
        const index = this.state.ids.indexOf(id)
        try {
            this.setState({
                ids: removeIndexFromArray(this.state.ids, index),
                players: removeIndexFromArray(this.state.players!, index),
                playerPlayStyles: removeIndexFromArray(this.state.playerPlayStyles!, index)
            })
        } catch {
            console.log("Error removing player")
            // TODO: Handle errors w/ notification
        }
    }

    private readonly handleAddPlayer = (player: Player) => {
        const {ids, players, playerPlayStyles} = this.state
        getPlayerPlayStyles(player.id)
            .then((playerPlayStyle) => {
                this.setState({
                    ids: [...ids, player.id],
                    players: [...players, player],
                    playerPlayStyles: [...playerPlayStyles, playerPlayStyle]
                })
            })
            .catch(() => {
                console.log("Error removing player")
                // TODO: handle catch and display notification
            })
    }

    private readonly handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState({inputId: event.target.value})
    }

    private readonly attemptToAddPlayer = () => {
        const {inputId, ids} = this.state
        if (inputId === "") {
            // TODO: Make input red to gain user's attention?
            return
        }

        if (ids.indexOf(inputId) === -1) {
            const playerId = inputId.match(/\d{17}/) ? getPlayerFromName(inputId) : Promise.resolve(inputId)

            playerId
                .then(getPlayer)
                .catch(() => {
                    console.log("Entered id is not a known player")
                    // TODO: handle catch and display notification
                })
                .then(this.handleAddPlayer)
                .then(() => this.setState({inputId: ""}))
                .catch((e) => {
                    console.log(e) // TypeError expected here when above .catch catches something.
                })
        } else {
            console.log("Entered id has already been added")
            // TODO: add notification
        }
    }
}

const removeIndexFromArray = <T extends {}>(array: T[], index: number): T[] => {
    return array.filter((__, i) => i !== index)
}
