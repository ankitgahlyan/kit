//
//  TONWalletApp.swift
//  TONWalletApp
//
//  Created by Nikita Rodionov on 11.09.2025.
//

import Foundation
import Combine
import SwiftUI
import TONWalletKit

@main
struct TONWalletApp: App {
    @State var initialized = false
    
    var body: some Scene {
        WindowGroup {
            if initialized {
                TONWalletAppView()
            } else {
                ProgressView()
                    .task {
                        do {
                            try await TONWalletKit.initialize(configuration: WalletKitConfig(
                                network: .mainnet,
                                storage: .memory,
                                bridgeUrl: "https://walletbot.me/tonconnect-bridge/bridge"
                            ), eventsHandler: TONEventsHandler.shared)
                            initialized = true
                        } catch {
                            debugPrint(error.localizedDescription)
                        }
                    }
            }
        }
    }
}
