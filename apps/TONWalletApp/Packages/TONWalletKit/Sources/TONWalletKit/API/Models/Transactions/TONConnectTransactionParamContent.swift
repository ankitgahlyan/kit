//
//  TONConnectTransactionParamContent.swift
//  TONWalletKit
//
//  Created by Nikita Rodionov on 13.10.2025.
//

import Foundation

public struct TONConnectTransactionParamMessage: Codable {
    public var address: String
    public var amount: String
    public var payload: String? // boc
    public var stateInit: String? // boc
    public var extraCurrency: TONConnectExtraCurrency?
    public var mode: Int?
    
    public init(
        address: String,
        amount: String,
        payload: String? = nil,
        stateInit: String? = nil,
        extraCurrency: TONConnectExtraCurrency? = nil,
        mode: Int? = nil
    ) {
        self.address = address
        self.amount = amount
        self.payload = payload
        self.stateInit = stateInit
        self.extraCurrency = extraCurrency
        self.mode = mode
    }
}

public struct TONConnectTransactionParamContent: Codable {
    public var messages: [TONConnectTransactionParamMessage]
    public var network: String?
    public var validUntil: TimeInterval?
    public var from: String?
    
    public init(
        messages: [TONConnectTransactionParamMessage],
        network: String? = nil,
        validUntil: TimeInterval? = nil,
        from: String? = nil
    ) {
        self.messages = messages
        self.network = network
        self.validUntil = validUntil
        self.from = from
    }
}
